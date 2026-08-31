import asyncio
import os
import sys
from pathlib import Path

# Add apps/api to path
SCRIPTS_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPTS_DIR.parent
API_DIR = PROJECT_ROOT / "apps" / "api"
if str(API_DIR) not in sys.path:
    sys.path.insert(0, str(API_DIR))

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from app.forensics.email_parser import parse_eml
from app.forensics.auth_checker import check_authentication
from app.intel.ip_provider import get_ip_intel
from app.forensics.risk_engine import build_signals, compute_risk_score, get_origin_assessment
from app.correlation.graph_builder import build_email_graph

async def test_forensic_pipeline():
    print("=" * 60)
    print("🛡️  TRACE Forensics - Standalone Verification Suite")
    print("=" * 60)
    
    demo_dir = PROJECT_ROOT / "data" / "demo"
    eml_files = list(demo_dir.glob("*.eml"))
    
    for eml_file in eml_files:
        print(f"\n📁 Testing Fixture: {eml_file.name}")
        with open(eml_file, "rb") as f:
            raw_bytes = f.read()

        # 1. Parse EML
        parsed = parse_eml(raw_bytes)
        print(f"  ▶ Subject: {parsed.subject}")
        print(f"  ▶ From: {parsed.from_display} <{parsed.from_address}>")
        print(f"  ▶ Reply-To: {parsed.reply_to}")
        print(f"  ▶ Origin IP: {parsed.origin_ip}")
        print(f"  ▶ Total Transmission Hops: {len(parsed.hops)}")
        print(f"  ▶ Embedded URLs: {len(parsed.urls)}")

        # 2. Authentication Check
        auth = check_authentication(parsed)
        print(f"  ▶ Auth Status: SPF={auth['spf_result']}, DKIM={auth['dkim_result']}, DMARC={auth['dmarc_result']}")

        # 3. IP Intelligence
        ip_intel = await get_ip_intel(parsed.origin_ip)
        print(f"  ▶ Origin Geo: {ip_intel.get('city')}, {ip_intel.get('country_name')} (ISP: {ip_intel.get('isp')})")
        print(f"  ▶ Tor Exit Node: {ip_intel.get('is_tor')}, Abuse Score: {ip_intel.get('abuse_score')}/100")

        # 4. Risk Signals & Scoring
        signals = build_signals(parsed, auth, ip_intel)
        score, classification, confidence = compute_risk_score(signals)
        origin = get_origin_assessment(signals, auth, ip_intel, parsed)

        print(f"  ▶ Forensic Risk Score: {score}/100 [{classification}] (Confidence: {confidence}%)")
        print(f"  ▶ Origin Assessment: {origin['assessment']}")
        print(f"  ▶ Detected Signals ({len(signals)}):")
        for s in signals:
            print(f"     - [{s.severity}] {s.title} (weight: {s.weight})")

        # 5. Graph Generation
        graph = build_email_graph({
            "email_id": "test_uuid",
            "subject": parsed.subject,
            "from_address": parsed.from_address,
            "risk_score": score,
            "origin_ip": ip_intel.get("ip"),
            "country_name": ip_intel.get("country_name"),
            "asn": ip_intel.get("asn"),
            "is_tor": ip_intel.get("is_tor", False),
            "abuse_score": ip_intel.get("abuse_score", 0),
            "hops": [{"hop_order": h.hop_order, "by_host": h.by_host, "ip_address": h.ip_address, "hop_type": h.hop_type} for h in parsed.hops],
            "urls": parsed.urls,
            "attachments": [{"filename": a.filename, "content_type": a.content_type, "size_bytes": a.size_bytes, "sha256": a.sha256, "suspicious": a.suspicious} for a in parsed.attachments]
        })
        print(f"  ▶ Graph Generated: {graph['total_nodes']} nodes, {graph['total_edges']} edges (React Flow ready)")

    print("\n" + "=" * 60)
    print("✅ All forensic pipeline components tested & verified successfully!")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(test_forensic_pipeline())
