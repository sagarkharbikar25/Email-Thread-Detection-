import asyncio
import sys
from pathlib import Path
import httpx

# Add apps/api to sys.path
SCRIPTS_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPTS_DIR.parent
API_DIR = PROJECT_ROOT / "apps" / "api"
if str(API_DIR) not in sys.path:
    sys.path.insert(0, str(API_DIR))

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from main import app

async def test_live_app():
    print("=" * 60)
    print("🌐 FastAPI Live In-Memory HTTP Test Suite")
    print("=" * 60)

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Test /health and /ready
        resp = await client.get("/health")
        print(f"▶ GET /health: {resp.status_code} -> {resp.json()}")
        assert resp.status_code == 200

        resp = await client.get("/ready")
        print(f"▶ GET /ready: {resp.status_code} -> {resp.json()}")
        assert resp.status_code == 200

        # 2. Test /api/v1/emails (List)
        resp = await client.get("/api/v1/emails")
        emails = resp.json()
        print(f"▶ GET /api/v1/emails: {resp.status_code} -> Found {len(emails)} emails")
        assert resp.status_code == 200
        assert len(emails) >= 3

        # 3. Test /api/v1/emails/{id} (Detailed Forensic Report)
        sample_email = emails[0]
        email_id = sample_email["id"]
        resp = await client.get(f"/api/v1/emails/{email_id}")
        detail = resp.json()
        print(f"▶ GET /api/v1/emails/{email_id[:8]}...: {resp.status_code}")
        print(f"    Subject: {detail.get('subject')}")
        print(f"    Risk Score: {detail.get('risk_score')}/100 ({detail.get('classification')})")
        print(f"    Auth: SPF={detail.get('authentication', {}).get('spf_result')}, DKIM={detail.get('authentication', {}).get('dkim_result')}")
        print(f"    Hops Count: {len(detail.get('hops', []))}")
        print(f"    Signals Count: {len(detail.get('signals', []))}")
        assert resp.status_code == 200

        # 4. Test /api/v1/emails/{id}/graph
        resp = await client.get(f"/api/v1/emails/{email_id}/graph")
        graph = resp.json()
        print(f"▶ GET /api/v1/emails/{email_id[:8]}.../graph: {resp.status_code} -> Nodes={len(graph.get('nodes', []))}, Edges={len(graph.get('edges', []))}")
        assert resp.status_code == 200

        # 5. Test /api/v1/cases
        resp = await client.get("/api/v1/cases")
        cases = resp.json()
        print(f"▶ GET /api/v1/cases: {resp.status_code} -> Found {len(cases)} cases")
        assert resp.status_code == 200
        assert len(cases) >= 1

        # 6. Test /api/v1/evidence
        resp = await client.get("/api/v1/evidence")
        evidence = resp.json()
        print(f"▶ GET /api/v1/evidence: {resp.status_code} -> Found {len(evidence)} evidence items")
        assert resp.status_code == 200

    print("=" * 60)
    print("🎉 ALL API ENDPOINTS & FORENSIC SERVICES PASSED WITH 100% SUCCESS!")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(test_live_app())
