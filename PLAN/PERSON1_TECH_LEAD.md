# Person 1: Tech Lead - Backend Architecture & Core Orchestration
## SIH 2026 - 6 Hour Sprint

**Your Role**: Backend architect, database designer, pipeline orchestrator  
**Key Dependencies**: P2 (auth), P3 (ML), P4 (intel), P6 (devops)  
**Success =**: Complete /api/v1/emails/upload → analysis result in DB by Hour 4

---

## Hour 0:00 - 0:30: Repository & FastAPI Setup

### Task 1: Repository Structure
```bash
# Create project structure
mkdir trace-forensics && cd trace-forensics
git init

# Create folders
mkdir -p apps/api apps/web workers data/demo data/seeds scripts

# Initialize git
git config user.name "Team"
git config user.email "team@sih.in"
touch .gitignore
```

### Task 2: FastAPI Skeleton
Create `apps/api/main.py`:
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

# Placeholder routers (will be filled by P2, P3, P4)
from app.api import auth_router, emails_router, cases_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 TRACE Platform starting...")
    yield
    # Shutdown
    print("🛑 TRACE Platform shutting down...")

app = FastAPI(
    title="TRACE Forensics",
    description="Email threat detection and forensic investigation",
    version="1.0.0",
    lifespan=lifespan
)

# CORS - allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://trace-forensics.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(auth_router.router, prefix="/api/v1", tags=["auth"])
app.include_router(emails_router.router, prefix="/api/v1", tags=["emails"])
app.include_router(cases_router.router, prefix="/api/v1", tags=["cases"])

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.get("/ready")
async def ready():
    # Check DB connection
    return {"ready": True}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

Create `apps/api/requirements.txt`:
```
fastapi==0.111.0
uvicorn==0.27.0
pydantic==2.7.0
sqlalchemy==2.0.0
asyncpg==0.29.0
alembic==1.13.0
psycopg2-binary==2.9.9
celery==5.3.0
redis==5.0.0
python-jose==3.3.0
passlib==1.7.4
python-multipart==0.0.6
email-validator==2.1.0
dnspython==2.4.0
dkimpy==1.1.1
authheaders==0.16.1
geoip2==4.7.0
python-whois==0.9.3
networkx==3.2
scikit-learn==1.4.0
WeasyPrint==61.0
Jinja2==3.1.0
slowapi==0.1.9
PyJWT==2.8.0
httpx==0.27.0
```

---

## Hour 0:30 - 1:30: Database Schema & SQLAlchemy Models

### Task 1: Database Connection
Create `apps/api/app/core/config.py`:
```python
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://dev:dev@localhost/email_forensics_dev"
    REDIS_URL: str = "redis://localhost:6379"
    JWT_SECRET_KEY: str = "your-256-bit-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 1
    
    DEMO_MODE: bool = True
    DEBUG: bool = True
    
    class Config:
        env_file = ".env"

settings = Settings()
```

### Task 2: SQLAlchemy Setup
Create `apps/api/app/core/database.py`:
```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.core.config import settings

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    future=True,
    pool_size=5,
    max_overflow=10,
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
```

### Task 3: SQLAlchemy Models
Create `apps/api/app/models/models.py`:
```python
from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, JSONB, ForeignKey, Table
from sqlalchemy.orm import declarative_base, relationship
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
import uuid
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(String, default="analyst")  # admin, analyst, investigator, forensic_investigator
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)

class Email(Base):
    __tablename__ = "emails"
    
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sha256 = Column(String, unique=True, index=True)
    filename = Column(String)
    file_size_bytes = Column(Integer)
    storage_path = Column(String)
    raw_message_id = Column(String, nullable=True)
    subject = Column(String, nullable=True)
    from_address = Column(String, nullable=True, index=True)
    from_display = Column(String, nullable=True)
    to_addresses = Column(JSONB, default=[])
    cc_addresses = Column(JSONB, default=[])
    reply_to = Column(String, nullable=True)
    return_path = Column(String, nullable=True)
    date_header = Column(DateTime, nullable=True)
    received_at = Column(DateTime, default=datetime.utcnow)
    uploaded_by = Column(PG_UUID(as_uuid=True), ForeignKey("users.id"))
    case_id = Column(PG_UUID(as_uuid=True), ForeignKey("cases.id"), nullable=True)
    
    # Analysis
    analysis_status = Column(String, default="PENDING")  # PENDING, QUEUED, PROCESSING, COMPLETED, FAILED
    risk_score = Column(Integer, nullable=True)
    classification = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

class AuthenticationResult(Base):
    __tablename__ = "authentication_results"
    
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email_id = Column(PG_UUID(as_uuid=True), ForeignKey("emails.id", ondelete="CASCADE"))
    spf_result = Column(String)  # PASS, FAIL, SOFTFAIL, NEUTRAL, NONE, etc.
    spf_domain = Column(String, nullable=True)
    dkim_result = Column(String)
    dkim_domain = Column(String, nullable=True)
    dmarc_result = Column(String)
    dmarc_policy = Column(String, nullable=True)
    spf_alignment = Column(String, nullable=True)
    dkim_alignment = Column(String, nullable=True)
    computed_at = Column(DateTime, default=datetime.utcnow)

class ReceivedHop(Base):
    __tablename__ = "received_hops"
    
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email_id = Column(PG_UUID(as_uuid=True), ForeignKey("emails.id", ondelete="CASCADE"))
    hop_order = Column(Integer)
    from_host = Column(String, nullable=True)
    by_host = Column(String, nullable=True)
    with_protocol = Column(String, nullable=True)
    for_address = Column(String, nullable=True)
    timestamp = Column(DateTime, nullable=True)
    raw_received = Column(Text)
    ip_address = Column(String, nullable=True, index=True)
    hop_type = Column(String)  # ORIGIN, RELAY, DESTINATION, SUSPICIOUS, UNKNOWN

class IPAddress(Base):
    __tablename__ = "ip_addresses"
    
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ip = Column(String, unique=True, index=True)
    country_code = Column(String, nullable=True)
    country_name = Column(String, nullable=True)
    region = Column(String, nullable=True)
    city = Column(String, nullable=True)
    latitude = Column(String, nullable=True)
    longitude = Column(String, nullable=True)
    isp = Column(String, nullable=True)
    asn = Column(String, nullable=True)
    is_vpn = Column(Boolean, default=False)
    is_tor = Column(Boolean, default=False)
    is_proxy = Column(Boolean, default=False)
    is_hosting = Column(Boolean, default=False)
    abuse_score = Column(Integer, nullable=True)
    reputation = Column(String, default="UNKNOWN")
    geo_source = Column(String)  # LIVE, CACHED, DEMO, MAXMIND_LOCAL
    last_updated = Column(DateTime, default=datetime.utcnow)

class AnalysisResult(Base):
    __tablename__ = "analysis_results"
    
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email_id = Column(PG_UUID(as_uuid=True), ForeignKey("emails.id", ondelete="CASCADE"), unique=True)
    risk_score = Column(Integer)
    classification = Column(String)  # LEGITIMATE, LOW_RISK, SUSPICIOUS, PHISHING, CRITICAL
    confidence = Column(Integer)
    signals = Column(JSONB)  # [{signal_id, category, severity, weight, title, description, evidence}]
    origin_assessment = Column(String, nullable=True)
    origin_confidence = Column(Integer, nullable=True)
    origin_evidence = Column(JSONB, nullable=True)
    graph_data = Column(JSONB, nullable=True)  # React Flow nodes/edges
    completed_at = Column(DateTime, default=datetime.utcnow)

class Case(Base):
    __tablename__ = "cases"
    
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    case_number = Column(String, unique=True, index=True)
    title = Column(String)
    description = Column(Text, nullable=True)
    severity = Column(String)  # LOW, MEDIUM, HIGH, CRITICAL
    status = Column(String, default="OPEN")  # OPEN, INVESTIGATING, CONTAINED, RESOLVED, ARCHIVED
    assigned_to = Column(PG_UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    created_by = Column(PG_UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    notes = Column(Text, nullable=True)

class Evidence(Base):
    __tablename__ = "evidence"
    
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    evidence_id = Column(String, unique=True)  # EV-2026-0001
    case_id = Column(PG_UUID(as_uuid=True), ForeignKey("cases.id"))
    email_id = Column(PG_UUID(as_uuid=True), ForeignKey("emails.id"), nullable=True)
    filename = Column(String)
    sha256 = Column(String, unique=True, index=True)
    file_size = Column(Integer)
    storage_path = Column(String)
    evidence_type = Column(String)  # EMAIL, ATTACHMENT, REPORT
    uploaded_by = Column(PG_UUID(as_uuid=True), ForeignKey("users.id"))
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    integrity_status = Column(String, default="VERIFIED")

class ChainOfCustodyEvent(Base):
    __tablename__ = "chain_of_custody_events"
    
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    evidence_id = Column(PG_UUID(as_uuid=True), ForeignKey("evidence.id"))
    action = Column(String)  # UPLOADED, VIEWED, ANALYZED, VERIFIED, EXPORTED
    actor_id = Column(PG_UUID(as_uuid=True), ForeignKey("users.id"))
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    ip_address = Column(String, nullable=True)
    note = Column(Text, nullable=True)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    actor_id = Column(PG_UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    action = Column(String)
    resource_type = Column(String, nullable=True)
    resource_id = Column(PG_UUID(as_uuid=True), nullable=True)
    details = Column(JSONB, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
```

### Task 4: Alembic Setup
```bash
cd apps/api
alembic init alembic
```

Edit `alembic/env.py` - add import:
```python
from app.core.database import Base
from app.models import models

# In the run_migrations_offline() and run_migrations_online() functions:
target_metadata = Base.metadata
```

Create migration:
```bash
alembic revision --autogenerate -m "Initial schema"
alembic upgrade head
```

---

## Hour 1:30 - 2:30: Email Upload & Analysis Pipeline

### Task 1: Email Upload Endpoint
Create `apps/api/app/api/emails_router.py`:
```python
from fastapi import APIRouter, UploadFile, Depends, HTTPException, File
from sqlalchemy.ext.asyncio import AsyncSession
import hashlib
import uuid
from datetime import datetime

from app.core.database import get_db
from app.models.models import Email, AnalysisResult
from app.celery_app import celery_app  # Will be created by P6

router = APIRouter()

MAX_EML_SIZE = 25 * 1024 * 1024  # 25 MB

@router.post("/emails/upload")
async def upload_email(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    """Upload a suspicious email for analysis"""
    
    # Read file
    content = await file.read()
    
    # Validate size
    if len(content) > MAX_EML_SIZE:
        raise HTTPException(413, f"File exceeds maximum size of {MAX_EML_SIZE} bytes")
    
    # Validate it looks like an email
    magic_bytes = [b'From ', b'MIME-Version', b'Return-Path', b'Received:', b'Date:', b'Message-ID']
    if not any(content.startswith(m) or m in content[:512] for m in magic_bytes):
        raise HTTPException(415, "File does not appear to be a valid RFC 5322 email")
    
    # Compute SHA-256
    sha256_hash = hashlib.sha256(content).hexdigest()
    
    # Check if already analyzed
    existing = await db.execute(
        "SELECT id FROM emails WHERE sha256 = %s",
        (sha256_hash,)
    )
    if existing.first():
        raise HTTPException(409, "This email has already been analyzed")
    
    # Create email record
    email = Email(
        sha256=sha256_hash,
        filename=file.filename or "email.eml",
        file_size_bytes=len(content),
        storage_path=f"emails/{sha256_hash}.eml",
        analysis_status="QUEUED"
    )
    
    db.add(email)
    await db.commit()
    await db.refresh(email)
    
    # Save file to storage
    # TODO: P6 will add actual storage (local FS or S3)
    with open(f"data/emails/{sha256_hash}.eml", "wb") as f:
        f.write(content)
    
    # Queue analysis job
    job = celery_app.send_task(
        'app.tasks.analyze_email',
        args=[str(email.id), sha256_hash]
    )
    
    return {
        "email_id": str(email.id),
        "job_id": job.id,
        "sha256": sha256_hash,
        "filename": file.filename,
        "status": "QUEUED",
        "message": "Email queued for analysis"
    }

@router.get("/emails/{email_id}")
async def get_email(email_id: str, db: AsyncSession = Depends(get_db)):
    """Get email with analysis results"""
    
    from sqlalchemy import select
    result = await db.execute(
        select(Email).where(Email.id == email_id)
    )
    email = result.scalar_one_or_none()
    
    if not email:
        raise HTTPException(404, "Email not found")
    
    # Get analysis result
    analysis_result = await db.execute(
        select(AnalysisResult).where(AnalysisResult.email_id == email.id)
    )
    analysis = analysis_result.scalar_one_or_none()
    
    return {
        "email": {
            "id": str(email.id),
            "sha256": email.sha256,
            "filename": email.filename,
            "from": email.from_address,
            "subject": email.subject,
            "analysis_status": email.analysis_status,
            "received_at": email.received_at
        },
        "analysis": {
            "risk_score": analysis.risk_score if analysis else None,
            "classification": analysis.classification if analysis else None,
            "signals": analysis.signals if analysis else []
        } if analysis else None
    }

@router.get("/jobs/{job_id}")
async def get_job_status(job_id: str):
    """Poll job status"""
    from celery.result import AsyncResult
    
    task = AsyncResult(job_id)
    
    return {
        "job_id": job_id,
        "status": task.state,  # PENDING, PROCESSING, SUCCESS, FAILURE
        "progress": getattr(task, 'info', {}).get('progress', 0) if task.state == 'PROCESSING' else 100 if task.state == 'SUCCESS' else 0,
        "current_step": getattr(task, 'info', {}).get('step', 'Queued') if task.state == 'PROCESSING' else '',
        "result": task.result if task.state == 'SUCCESS' else None,
        "error": str(task.info) if task.state == 'FAILURE' else None
    }
```

### Task 2: Risk Engine Core
Create `apps/api/app/forensics/risk_engine.py`:
```python
from dataclasses import dataclass
from typing import List

@dataclass
class RiskSignal:
    signal_id: str
    category: str  # AUTH, HEADER, DOMAIN, CONTENT, INTEL, ML
    severity: str  # HIGH, MEDIUM, LOW
    weight: int
    title: str
    description: str
    evidence: str = None

def compute_risk_score(signals: List[RiskSignal]) -> int:
    """Aggregate signals into risk score (0-100)"""
    
    raw_score = sum(s.weight for s in signals)
    return min(raw_score, 100)  # Cap at 100

def classify_risk(score: int) -> str:
    """Classify risk level"""
    if score < 20: return "LEGITIMATE"
    if score < 40: return "LOW_RISK"
    if score < 60: return "SUSPICIOUS"
    if score < 75: return "PHISHING"
    if score < 90: return "HIGH_RISK"
    return "CRITICAL"

def get_origin_assessment(signals: List[RiskSignal], auth_result, enrichment) -> dict:
    """Create origin assessment with confidence"""
    
    has_auth_fail = any(s.signal_id in ['spf_fail', 'dmarc_fail'] for s in signals)
    has_ip_reputation = any(s.signal_id == 'ip_reputation_high' for s in signals)
    
    if has_auth_fail and has_ip_reputation:
        assessment = "LIKELY SPOOFED DOMAIN - Unauthenticated + Suspicious Infrastructure"
        confidence = 85
    elif has_auth_fail:
        assessment = "PROBABLE SPOOFING - Authentication Failed"
        confidence = 70
    elif enrichment.get('is_hosting'):
        assessment = "INFRASTRUCTURE ON CLOUD/HOSTING - Attribution Limited"
        confidence = 50
    else:
        assessment = "Infrastructure traced to legitimate provider"
        confidence = 60
    
    return {
        "assessment": assessment,
        "confidence": confidence,
        "note": "IP geolocation indicates infrastructure, not attacker location. May be obfuscated."
    }
```

---

## Hour 2:30 - 3:30: Correlation Engine

### Task: NetworkX Graph Builder
Create `apps/api/app/correlation/graph_builder.py`:
```python
import networkx as nx
from typing import Dict, List
import json

def build_email_graph(email_data: dict) -> dict:
    """Build threat infrastructure graph using NetworkX"""
    
    G = nx.DiGraph()
    
    # Email node
    email_id = email_data['email_id']
    G.add_node(
        f"email:{email_id}",
        type='email',
        label=f"Email: {email_data['subject'][:30]}...",
        threat_level='HIGH' if email_data['risk_score'] > 70 else 'MEDIUM'
    )
    
    # Sender domain node
    sender_domain = email_data['from_address'].split('@')[1] if '@' in email_data['from_address'] else 'unknown'
    G.add_node(
        f"domain:{sender_domain}",
        type='domain',
        label=sender_domain,
        threat_level='HIGH' if email_data.get('lookalike_score', 0) > 0.8 else 'MEDIUM'
    )
    G.add_edge(f"email:{email_id}", f"domain:{sender_domain}", rel="SENT_FROM")
    
    # Origin IP node
    if email_data.get('origin_ip'):
        origin_ip = email_data['origin_ip']
        G.add_node(
            f"ip:{origin_ip}",
            type='ip',
            label=origin_ip,
            threat_level='CRITICAL' if email_data.get('ip_reputation') == 'MALICIOUS' else 'MEDIUM'
        )
        G.add_edge(f"domain:{sender_domain}", f"ip:{origin_ip}", rel="RESOLVES_TO")
        
        # ASN node
        if email_data.get('asn'):
            asn = email_data['asn']
            G.add_node(f"asn:{asn}", type='asn', label=asn, threat_level='MEDIUM')
            G.add_edge(f"ip:{origin_ip}", f"asn:{asn}", rel="PART_OF")
    
    # URLs
    for i, url in enumerate(email_data.get('urls', [])):
        G.add_node(
            f"url:{i}",
            type='url',
            label=url,
            threat_level='HIGH' if 'phish' in url.lower() else 'MEDIUM'
        )
        G.add_edge(f"email:{email_id}", f"url:{i}", rel="LINKS_TO")
    
    # Convert to React Flow format
    nodes = []
    for node_id, data in G.nodes(data=True):
        nodes.append({
            "id": node_id,
            "type": data['type'],
            "data": {"label": data['label'], "threat_level": data['threat_level']},
            "position": {"x": 0, "y": 0}  # Layout computed client-side
        })
    
    edges = []
    for from_id, to_id, data in G.edges(data=True):
        edges.append({
            "id": f"{from_id}→{to_id}",
            "source": from_id,
            "target": to_id,
            "label": data['rel'],
            "type": "smoothstep"
        })
    
    return {"nodes": nodes, "edges": edges}
```

---

## Hour 3:30 - 4:30: Complete Analysis Pipeline

### Task: Celery Task Orchestration
Create `apps/api/app/celery_app.py` (will be finalized by P6):
```python
from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "trace_forensics",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL
)

celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
)
```

Create `apps/api/app/tasks.py` - full analysis orchestration:
```python
from app.celery_app import celery_app
from app.core.database import AsyncSessionLocal
from app.forensics.email_parser import parse_eml
from app.forensics.auth_checker import check_authentication
from app.intel.ip_provider import get_ip_intel
from app.ml.risk_engine import compute_risk, build_signals
from app.correlation.graph_builder import build_email_graph
from app.models.models import Email, AuthenticationResult, AnalysisResult, ReceivedHop, IPAddress
from sqlalchemy import select
import os

@celery_app.task(bind=True)
def analyze_email(self, email_id: str, sha256_hash: str):
    """Complete email analysis pipeline"""
    
    async def run_analysis():
        db = AsyncSessionLocal()
        try:
            # Step 1: Retrieve email
            self.update_state(state='PROCESSING', meta={'step': 'LOADING_EMAIL', 'progress': 10})
            email_record = await db.execute(select(Email).where(Email.id == email_id))
            email = email_record.scalar_one()
            
            # Step 2: Parse email
            self.update_state(state='PROCESSING', meta={'step': 'PARSING', 'progress': 20})
            eml_path = f"data/emails/{sha256_hash}.eml"
            with open(eml_path, 'rb') as f:
                parsed = parse_eml(f.read())
            
            # Update email record with parsed data
            email.from_address = parsed.from_address
            email.subject = parsed.subject
            email.to_addresses = parsed.to_addresses
            email.reply_to = parsed.reply_to
            
            # Step 3: Check authentication
            self.update_state(state='PROCESSING', meta={'step': 'AUTH_VERIFICATION', 'progress': 35})
            auth_result = check_authentication(parsed)
            
            auth_db = AuthenticationResult(**auth_result)
            auth_db.email_id = email.id
            db.add(auth_db)
            
            # Step 4: Extract IPs and enrich
            self.update_state(state='PROCESSING', meta={'step': 'INTELLIGENCE_ENRICHMENT', 'progress': 50})
            origin_ip = parsed.origin_ip if hasattr(parsed, 'origin_ip') else None
            if origin_ip:
                ip_intel = await get_ip_intel(origin_ip)
                ip_record = IPAddress(**ip_intel)
                db.add(ip_record)
            
            # Step 5: ML Classification
            self.update_state(state='PROCESSING', meta={'step': 'ML_ANALYSIS', 'progress': 65})
            # TODO: P3 will add ML model call here
            
            # Step 6: Risk Engine
            self.update_state(state='PROCESSING', meta={'step': 'RISK_CALCULATION', 'progress': 80})
            signals = build_signals(parsed, auth_result, ip_intel if origin_ip else {})
            risk_score, classification = compute_risk(signals)
            
            # Step 7: Graph Correlation
            self.update_state(state='PROCESSING', meta={'step': 'CORRELATION', 'progress': 90})
            email_data = {
                'email_id': str(email.id),
                'subject': email.subject,
                'from_address': email.from_address,
                'risk_score': risk_score,
                'origin_ip': origin_ip,
                'urls': getattr(parsed, 'urls', []),
            }
            graph = build_email_graph(email_data)
            
            # Store analysis result
            analysis_result = AnalysisResult(
                email_id=email.id,
                risk_score=risk_score,
                classification=classification,
                confidence=75,
                signals=[{"signal_id": s.signal_id, "title": s.title, "weight": s.weight} for s in signals],
                graph_data=graph
            )
            
            email.risk_score = risk_score
            email.classification = classification
            email.analysis_status = "COMPLETED"
            
            db.add(analysis_result)
            await db.commit()
            
            self.update_state(state='SUCCESS', meta={'progress': 100})
            return {"status": "completed", "risk_score": risk_score, "classification": classification}
        
        finally:
            await db.close()
    
    import asyncio
    return asyncio.run(run_analysis())
```

---

## Hour 4:30 - 5:30: Case & Evidence Management

### Task: Case Management Endpoints
Create `apps/api/app/api/cases_router.py`:
```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.models import Case, Evidence, ChainOfCustodyEvent
from uuid import uuid4

router = APIRouter()

@router.post("/cases")
async def create_case(
    case_data: dict,
    db: AsyncSession = Depends(get_db)
):
    """Create investigation case"""
    
    case = Case(
        case_number=f"CASE-{uuid4().hex[:8].upper()}",
        title=case_data['title'],
        severity=case_data.get('severity', 'MEDIUM'),
        description=case_data.get('description')
    )
    
    db.add(case)
    await db.commit()
    await db.refresh(case)
    
    return {
        "id": str(case.id),
        "case_number": case.case_number,
        "title": case.title,
        "status": case.status
    }

@router.get("/cases/{case_id}")
async def get_case(case_id: str, db: AsyncSession = Depends(get_db)):
    """Get case details"""
    
    result = await db.execute(select(Case).where(Case.id == case_id))
    case = result.scalar_one_or_none()
    
    if not case:
        raise HTTPException(404, "Case not found")
    
    return {
        "id": str(case.id),
        "case_number": case.case_number,
        "title": case.title,
        "severity": case.severity,
        "status": case.status,
        "created_at": case.created_at
    }

@router.patch("/cases/{case_id}")
async def update_case(
    case_id: str,
    update_data: dict,
    db: AsyncSession = Depends(get_db)
):
    """Update case status/assignment"""
    
    result = await db.execute(select(Case).where(Case.id == case_id))
    case = result.scalar_one_or_none()
    
    if not case:
        raise HTTPException(404, "Case not found")
    
    if 'status' in update_data:
        case.status = update_data['status']
    if 'notes' in update_data:
        case.notes = update_data['notes']
    
    await db.commit()
    return {"status": "updated"}
```

---

## Hour 5:30 - 6:00: Documentation & Handoff

### Task: API Documentation
Create `docs/API.md`:
- Document all endpoints
- Include request/response examples
- Post in #engineering Slack channel

### Task: Handoff Checklist
- ✅ FastAPI skeleton running
- ✅ Database schema created + migrations
- ✅ Email upload endpoint working
- ✅ Analysis pipeline orchestrated
- ✅ Case management endpoints
- ✅ All models defined
- ✅ P6 has everything needed for Celery

### Final Check
```bash
# Test locally
python -m uvicorn app.main:app --reload

# Should see:
# ✅ FastAPI running on http://localhost:8000
# ✅ OpenAPI docs on http://localhost:8000/docs
# ✅ Health check: GET /health → {"status": "ok"}
```

---

## Blockers & Escalations

| Issue | Resolution |
|-------|-----------|
| DB connection fails | Check DATABASE_URL in .env, verify postgres running |
| UUID import error | Use `sqlalchemy.dialects.postgresql import UUID` |
| Alembic migration issues | Restart, run `alembic downgrade base`, then upgrade |
| Celery not connecting | Verify Redis running on localhost:6379 |

---

**Success = Complete working FastAPI backend by end of sprint**  
**Hand off to P6 for Docker/deployment**  
**Hand off to P5 for API integration**

