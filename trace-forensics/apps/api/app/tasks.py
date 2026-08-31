import asyncio
import os
import logging
from sqlalchemy import select, delete
from app.core.database import AsyncSessionLocal
from app.models.models import Email, AuthenticationResult, AnalysisResult, ReceivedHop, IPAddress
from app.forensics.email_parser import parse_eml
from app.forensics.auth_checker import check_authentication
from app.intel.ip_provider import get_ip_intel
from app.forensics.risk_engine import build_signals, compute_risk_score, get_origin_assessment
from app.correlation.graph_builder import build_email_graph
from app.core.config import settings

logger = logging.getLogger("trace.pipeline")

async def run_analysis_pipeline_async(email_id: str, sha256_hash: str) -> dict:
    """
    Executes the complete 7-step email forensic investigation pipeline.
    """
    async with AsyncSessionLocal() as db:
        try:
            logger.info(f"Starting forensic pipeline for Email ID: {email_id} ({sha256_hash})")
            
            # Step 1: Retrieve email record
            stmt = select(Email).where(Email.id == email_id)
            res = await db.execute(stmt)
            email_record = res.scalar_one_or_none()
            if not email_record:
                logger.error(f"Email {email_id} not found in database.")
                return {"status": "FAILED", "error": "Email record not found"}

            email_record.analysis_status = "PROCESSING"
            await db.commit()

            # Step 2: Read raw .eml and parse
            eml_path = email_record.storage_path
            if not os.path.exists(eml_path):
                # Check alternative storage directory
                eml_path = os.path.join(settings.STORAGE_DIR, f"{sha256_hash}.eml")
                
            if not os.path.exists(eml_path):
                logger.error(f"Raw EML file missing at {eml_path}")
                email_record.analysis_status = "FAILED"
                await db.commit()
                return {"status": "FAILED", "error": "Raw .eml file missing"}

            with open(eml_path, "rb") as f:
                raw_bytes = f.read()

            parsed = parse_eml(raw_bytes)

            # Update email metadata
            email_record.subject = parsed.subject or "No Subject"
            email_record.raw_message_id = parsed.raw_message_id
            email_record.from_address = parsed.from_address
            email_record.from_display = parsed.from_display
            email_record.to_addresses = parsed.to_addresses
            email_record.cc_addresses = parsed.cc_addresses
            email_record.reply_to = parsed.reply_to
            email_record.return_path = parsed.return_path
            email_record.date_header = parsed.date_header
            email_record.has_attachments = len(parsed.attachments) > 0
            email_record.attachments_count = len(parsed.attachments)

            # Step 3: Check SPF/DKIM/DMARC Authentication
            auth_data = check_authentication(parsed)
            
            # Upsert AuthenticationResult
            await db.execute(delete(AuthenticationResult).where(AuthenticationResult.email_id == email_id))
            auth_db = AuthenticationResult(
                email_id=email_id,
                spf_result=auth_data["spf_result"],
                spf_domain=auth_data["spf_domain"],
                spf_alignment=auth_data["spf_alignment"],
                dkim_result=auth_data["dkim_result"],
                dkim_domain=auth_data["dkim_domain"],
                dkim_selector=auth_data["dkim_selector"],
                dkim_alignment=auth_data["dkim_alignment"],
                dmarc_result=auth_data["dmarc_result"],
                dmarc_policy=auth_data["dmarc_policy"],
                details=auth_data["details"]
            )
            db.add(auth_db)

            # Step 4: Extract and enrich transmission hops & origin IP
            await db.execute(delete(ReceivedHop).where(ReceivedHop.email_id == email_id))
            origin_ip_intel = {}
            for hop in parsed.hops:
                geo_info = {}
                if hop.ip_address:
                    geo_info = await get_ip_intel(hop.ip_address)
                    if hop.hop_order == 1 or hop.hop_type == "ORIGIN":
                        origin_ip_intel = geo_info
                        
                hop_db = ReceivedHop(
                    email_id=email_id,
                    hop_order=hop.hop_order,
                    from_host=hop.from_host,
                    by_host=hop.by_host,
                    with_protocol=hop.with_protocol,
                    for_address=hop.for_address,
                    timestamp=hop.timestamp,
                    raw_received=hop.raw_received,
                    ip_address=hop.ip_address,
                    hop_type=hop.hop_type,
                    geo_data=geo_info
                )
                db.add(hop_db)

            if not origin_ip_intel and parsed.origin_ip:
                origin_ip_intel = await get_ip_intel(parsed.origin_ip)

            # Step 5: Risk calculation & Signal generation
            signals = build_signals(parsed, auth_data, origin_ip_intel)
            risk_score, classification, confidence = compute_risk_score(signals)
            origin_assess = get_origin_assessment(signals, auth_data, origin_ip_intel, parsed)

            # Step 6: Build Threat Infrastructure Graph
            email_graph_data = {
                "email_id": email_id,
                "subject": email_record.subject,
                "from_address": email_record.from_address,
                "risk_score": risk_score,
                "origin_ip": origin_ip_intel.get("ip"),
                "country_name": origin_ip_intel.get("country_name"),
                "asn": origin_ip_intel.get("asn"),
                "is_tor": origin_ip_intel.get("is_tor", False),
                "abuse_score": origin_ip_intel.get("abuse_score", 0),
                "hops": [
                    {
                        "hop_order": h.hop_order,
                        "by_host": h.by_host,
                        "from_host": h.from_host,
                        "ip_address": h.ip_address,
                        "hop_type": h.hop_type
                    } for h in parsed.hops
                ],
                "urls": parsed.urls,
                "attachments": [
                    {
                        "filename": a.filename,
                        "content_type": a.content_type,
                        "size_bytes": a.size_bytes,
                        "sha256": a.sha256,
                        "suspicious": a.suspicious
                    } for a in parsed.attachments
                ]
            }
            graph = build_email_graph(email_graph_data)

            # Step 7: Store Analysis Results & Finalize Status
            await db.execute(delete(AnalysisResult).where(AnalysisResult.email_id == email_id))
            analysis_db = AnalysisResult(
                email_id=email_id,
                risk_score=risk_score,
                classification=classification,
                confidence=confidence,
                signals=[
                    {
                        "signal_id": s.signal_id,
                        "category": s.category,
                        "severity": s.severity,
                        "weight": s.weight,
                        "title": s.title,
                        "description": s.description,
                        "evidence": s.evidence
                    } for s in signals
                ],
                origin_assessment=origin_assess["assessment"],
                origin_confidence=origin_assess["confidence"],
                origin_evidence=origin_assess["evidence"],
                graph_data=graph,
                attachments_analysis=[
                    {
                        "filename": a.filename,
                        "content_type": a.content_type,
                        "size_bytes": a.size_bytes,
                        "sha256": a.sha256,
                        "suspicious": a.suspicious,
                        "reasons": a.reasons
                    } for a in parsed.attachments
                ],
                urls_analysis=parsed.urls
            )
            db.add(analysis_db)

            # Update master Email record
            email_record.risk_score = risk_score
            email_record.classification = classification
            email_record.analysis_status = "COMPLETED"

            await db.commit()
            logger.info(f"Forensic pipeline completed for {email_id}. Score={risk_score}, Class={classification}")
            
            return {
                "status": "COMPLETED",
                "email_id": email_id,
                "risk_score": risk_score,
                "classification": classification,
                "confidence": confidence
            }

        except Exception as e:
            logger.exception(f"Error during forensic analysis for {email_id}: {e}")
            await db.rollback()
            try:
                email_record.analysis_status = "FAILED"
                await db.commit()
            except Exception:
                pass
            return {"status": "FAILED", "error": str(e)}

# Celery task wrapper (if Celery worker is active)
try:
    from app.celery_app import celery_app
    if celery_app:
        @celery_app.task(bind=True, name="app.tasks.analyze_email")
        def analyze_email_task(self, email_id: str, sha256_hash: str):
            return asyncio.run(run_analysis_pipeline_async(email_id, sha256_hash))
except Exception:
    pass
