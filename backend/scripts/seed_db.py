import asyncio
import os
import sys
import hashlib
from pathlib import Path
from datetime import datetime, timezone

# Add apps/api to path
SCRIPTS_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPTS_DIR.parent
API_DIR = PROJECT_ROOT / "apps" / "api"
if str(API_DIR) not in sys.path:
    sys.path.insert(0, str(API_DIR))

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

from app.core.database import init_db, AsyncSessionLocal
from app.core.security import get_password_hash
from app.models.models import User, Case, Email, Evidence, ChainOfCustodyEvent
from app.tasks import run_analysis_pipeline_async
from app.core.config import settings

async def seed_database():
    print("🌱 Starting TRACE Forensics database seeding...")
    await init_db()

    async with AsyncSessionLocal() as session:
        # 1. Create Default Users
        users_data = [
            {
                "username": "analyst",
                "email": "analyst@trace.forensics.in",
                "full_name": "Senior SOC Analyst",
                "password": "Password@123",
                "role": "analyst"
            },
            {
                "username": "lead_investigator",
                "email": "lead@trace.forensics.in",
                "full_name": "Cyber Forensic Lead",
                "password": "Password@123",
                "role": "investigator"
            },
            {
                "username": "admin",
                "email": "admin@trace.forensics.in",
                "full_name": "System Administrator",
                "password": "AdminPassword@2026",
                "role": "admin"
            }
        ]

        created_users = {}
        for u in users_data:
            existing = await session.execute(User.__table__.select().where(User.username == u["username"]))
            if not existing.first():
                user_obj = User(
                    username=u["username"],
                    email=u["email"],
                    full_name=u["full_name"],
                    password_hash=get_password_hash(u["password"]),
                    role=u["role"],
                    created_at=datetime.now(timezone.utc)
                )
                session.add(user_obj)
                await session.flush()
                created_users[u["username"]] = user_obj.id
                print(f"  ✅ Created user: {u['username']} ({u['role']})")

        await session.commit()

        # 2. Create Default Investigation Case
        case_obj = Case(
            case_number="CASE-2026-SIH01",
            title="Operation PhishGuard: Q3 Financial Phishing & Executive Spoofing Investigation",
            description="Active forensic campaign targeting high-value corporate accounts through lookalike domains and credential harvesting relays.",
            severity="HIGH",
            status="INVESTIGATING",
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        session.add(case_obj)
        await session.commit()
        await session.refresh(case_obj)
        print(f"  ✅ Created case: {case_obj.case_number}")

        # 3. Seed & Analyze Sample EML Files
        demo_dir = PROJECT_ROOT / "data" / "demo"
        eml_files = list(demo_dir.glob("*.eml"))
        
        for eml_path in eml_files:
            with open(eml_path, "rb") as f:
                content = f.read()

            sha256_hash = hashlib.sha256(content).hexdigest()
            dest_path = settings.STORAGE_DIR / f"{sha256_hash}.eml"
            with open(dest_path, "wb") as f:
                f.write(content)

            email_record = Email(
                sha256=sha256_hash,
                filename=eml_path.name,
                file_size_bytes=len(content),
                storage_path=str(dest_path),
                analysis_status="PROCESSING",
                case_id=case_obj.id,
                created_at=datetime.now(timezone.utc)
            )
            session.add(email_record)
            await session.commit()
            await session.refresh(email_record)

            # Register Evidence
            ev_id = f"EV-{datetime.now().strftime('%Y%m%d')}-{sha256_hash[:6].upper()}"
            ev_record = Evidence(
                evidence_id=ev_id,
                case_id=case_obj.id,
                email_id=email_record.id,
                filename=eml_path.name,
                sha256=sha256_hash,
                file_size=len(content),
                storage_path=str(dest_path),
                evidence_type="EMAIL",
                integrity_status="VERIFIED",
                uploaded_at=datetime.now(timezone.utc)
            )
            session.add(ev_record)
            await session.commit()
            await session.refresh(ev_record)

            # Add Chain of Custody event
            coc = ChainOfCustodyEvent(
                evidence_id=ev_record.id,
                action="INGESTED_AND_ANALYZED",
                actor_name="Forensic Automation Pipeline",
                timestamp=datetime.now(timezone.utc),
                note="Initial cryptographic hash generation and chain-of-custody lock."
            )
            session.add(coc)
            await session.commit()

            print(f"  ⚙️ Running forensic analysis pipeline for {eml_path.name}...")
            await run_analysis_pipeline_async(email_record.id, sha256_hash)
            print(f"  ✅ Analyzed {eml_path.name} (SHA-256: {sha256_hash[:12]}...)")

    print("🎉 Database seeding and demo data ingest completed successfully!")

if __name__ == "__main__":
    asyncio.run(seed_database())
