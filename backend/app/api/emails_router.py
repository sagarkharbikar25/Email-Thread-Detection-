from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Query, BackgroundTasks, Response
from fastapi.responses import PlainTextResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List, Optional
import hashlib
import os
import uuid
from datetime import datetime, timezone

from app.core.database import get_db
from app.core.config import settings
from app.models.models import Email, AuthenticationResult, AnalysisResult, ReceivedHop, User
from app.schemas.schemas import (
    UploadResponse, EmailSummarySchema, EmailDetailSchema,
    AuthResultSchema, HopSchema, RiskSignalSchema, ThreatGraphSchema, AttachmentMetaSchema
)
from app.tasks import run_analysis_pipeline_async
from app.api.auth_router import get_current_user

router = APIRouter(prefix="/emails", tags=["emails"])

@router.post("/upload", response_model=UploadResponse)
async def upload_email(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user),
    sync_mode: bool = Query(True, description="Execute analysis synchronously for instant results")
):
    """
    Upload a suspicious RFC 5322 .eml file for forensic investigation.
    Computes SHA-256 hash, stores raw evidence, and initiates forensic pipeline.
    """
    # 1. Read file content
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    if len(content) > settings.MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds maximum allowed size of {settings.MAX_FILE_SIZE_BYTES // (1024 * 1024)} MB."
        )

    # 2. Compute SHA-256
    sha256_hash = hashlib.sha256(content).hexdigest()

    # 3. Check for duplicates
    stmt = select(Email).where(Email.sha256 == sha256_hash)
    existing_res = await db.execute(stmt)
    existing_email = existing_res.scalar_one_or_none()

    if existing_email:
        # Re-run or return existing
        return UploadResponse(
            email_id=existing_email.id,
            sha256=existing_email.sha256,
            filename=existing_email.filename,
            file_size_bytes=existing_email.file_size_bytes,
            status=existing_email.analysis_status,
            message="Email has already been analyzed and retrieved from forensic store.",
            risk_score=existing_email.risk_score,
            classification=existing_email.classification
        )

    # 4. Save raw file to storage
    filename = file.filename or f"email_{sha256_hash[:8]}.eml"
    storage_path = os.path.join(settings.STORAGE_DIR, f"{sha256_hash}.eml")
    with open(storage_path, "wb") as f:
        f.write(content)

    # 5. Create DB Record
    email_id = str(uuid.uuid4())
    new_email = Email(
        id=email_id,
        sha256=sha256_hash,
        filename=filename,
        file_size_bytes=len(content),
        storage_path=storage_path,
        analysis_status="PROCESSING" if sync_mode else "QUEUED",
        uploaded_by=current_user.id if current_user else None,
        created_at=datetime.now(timezone.utc)
    )
    db.add(new_email)
    await db.commit()
    await db.refresh(new_email)

    # 6. Execute Pipeline
    if sync_mode:
        # Direct execution for zero-latency presentation demo
        result = await run_analysis_pipeline_async(email_id, sha256_hash)
        await db.refresh(new_email)
        return UploadResponse(
            email_id=new_email.id,
            sha256=new_email.sha256,
            filename=new_email.filename,
            file_size_bytes=new_email.file_size_bytes,
            status=new_email.analysis_status,
            message="Forensic investigation completed successfully.",
            risk_score=new_email.risk_score,
            classification=new_email.classification
        )
    else:
        # Async background execution
        background_tasks.add_task(run_analysis_pipeline_async, email_id, sha256_hash)
        return UploadResponse(
            email_id=new_email.id,
            sha256=new_email.sha256,
            filename=new_email.filename,
            file_size_bytes=new_email.file_size_bytes,
            status="QUEUED",
            message="Email queued for asynchronous forensic pipeline.",
            job_id=email_id
        )

@router.get("", response_model=List[EmailSummarySchema])
async def list_emails(
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db)
):
    """List all ingested emails with summary forensic scores."""
    stmt = select(Email).order_by(desc(Email.created_at)).offset(skip).limit(limit)
    res = await db.execute(stmt)
    emails = res.scalars().all()
    return emails

@router.get("/{email_id}", response_model=EmailDetailSchema)
async def get_email_details(email_id: str, db: AsyncSession = Depends(get_db)):
    """
    Get comprehensive forensic analysis report for an email.
    Includes headers, authentication verification, transmission hops, risk signals, and graph data.
    """
    email_res = await db.execute(select(Email).where(Email.id == email_id))
    email = email_res.scalar_one_or_none()
    if not email:
        raise HTTPException(status_code=404, detail="Email not found")

    auth_res = await db.execute(select(AuthenticationResult).where(AuthenticationResult.email_id == email_id))
    auth = auth_res.scalar_one_or_none()

    hops_res = await db.execute(select(ReceivedHop).where(ReceivedHop.email_id == email_id).order_by(ReceivedHop.hop_order))
    hops = hops_res.scalars().all()

    analysis_res = await db.execute(select(AnalysisResult).where(AnalysisResult.email_id == email_id))
    analysis = analysis_res.scalar_one_or_none()

    # Structure response
    auth_schema = None
    if auth:
        auth_schema = AuthResultSchema(
            spf_result=auth.spf_result,
            spf_domain=auth.spf_domain,
            spf_alignment=auth.spf_alignment,
            dkim_result=auth.dkim_result,
            dkim_domain=auth.dkim_domain,
            dkim_selector=auth.dkim_selector,
            dkim_alignment=auth.dkim_alignment,
            dmarc_result=auth.dmarc_result,
            dmarc_policy=auth.dmarc_policy,
            details=auth.details or {}
        )

    hops_schema = [
        HopSchema(
            hop_order=h.hop_order,
            from_host=h.from_host,
            by_host=h.by_host,
            with_protocol=h.with_protocol,
            for_address=h.for_address,
            timestamp=h.timestamp,
            ip_address=h.ip_address,
            hop_type=h.hop_type,
            geo_data=h.geo_data or {}
        ) for h in hops
    ]

    signals_schema = []
    origin_assessment = None
    origin_confidence = None
    graph_data = None
    attachments_schema = []
    urls_schema = []

    if analysis:
        signals_schema = [RiskSignalSchema(**s) for s in (analysis.signals or [])]
        origin_assessment = analysis.origin_assessment
        origin_confidence = analysis.origin_confidence
        graph_data = ThreatGraphSchema(**analysis.graph_data) if analysis.graph_data else None
        attachments_schema = [AttachmentMetaSchema(**a) for a in (analysis.attachments_analysis or [])]
        urls_schema = analysis.urls_analysis or []

    return EmailDetailSchema(
        id=email.id,
        sha256=email.sha256,
        filename=email.filename,
        file_size_bytes=email.file_size_bytes,
        raw_message_id=email.raw_message_id,
        subject=email.subject,
        from_address=email.from_address,
        from_display=email.from_display,
        to_addresses=email.to_addresses or [],
        cc_addresses=email.cc_addresses or [],
        reply_to=email.reply_to,
        return_path=email.return_path,
        date_header=email.date_header,
        analysis_status=email.analysis_status,
        risk_score=email.risk_score,
        classification=email.classification,
        created_at=email.created_at,
        authentication=auth_schema,
        hops=hops_schema,
        signals=signals_schema,
        attachments=attachments_schema,
        urls=urls_schema,
        origin_assessment=origin_assessment,
        origin_confidence=origin_confidence,
        graph_data=graph_data
    )

@router.get("/{email_id}/graph", response_model=ThreatGraphSchema)
async def get_email_threat_graph(email_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieve React Flow compatible threat infrastructure graph for email."""
    res = await db.execute(select(AnalysisResult).where(AnalysisResult.email_id == email_id))
    analysis = res.scalar_one_or_none()
    if not analysis or not analysis.graph_data:
        raise HTTPException(status_code=404, detail="Threat graph not found for this email")
    return ThreatGraphSchema(**analysis.graph_data)

@router.get("/{email_id}/raw", response_class=PlainTextResponse)
async def get_raw_eml(email_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieve raw RFC 5322 .eml file content for forensic inspection."""
    res = await db.execute(select(Email).where(Email.id == email_id))
    email = res.scalar_one_or_none()
    if not email:
        raise HTTPException(status_code=404, detail="Email not found")

    if not os.path.exists(email.storage_path):
        raise HTTPException(status_code=404, detail="Raw EML file not found in storage")

    with open(email.storage_path, "r", encoding="utf-8", errors="replace") as f:
        return f.read()
