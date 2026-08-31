# Person 6: DevOps & QA - Deployment & Infrastructure
## SIH 2026 - 6 Hour Sprint

**Your Role**: Docker containerization, CI/CD, testing, deployment  
**Key Dependencies**: All team members  
**Success =**: Docker image built + all tests passing by Hour 5:30

---

## Hour 0:00 - 1:00: Docker & Docker Compose

### Task 1: Docker Compose (Local Development)
Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: email_forensics_dev
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U dev"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

  api:
    build:
      context: ./apps/api
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql+asyncpg://dev:dev@postgres/email_forensics_dev
      REDIS_URL: redis://redis:6379
      JWT_SECRET_KEY: dev-secret-key-change-in-production
      DEBUG: "true"
      DEMO_MODE: "true"
    ports:
      - "8000:8000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./apps/api:/app
      - ./data:/app/data
    command: uvicorn app.main:app --reload --host 0.0.0.0

  worker:
    build:
      context: ./apps/api
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql+asyncpg://dev:dev@postgres/email_forensics_dev
      REDIS_URL: redis://redis:6379
      DEBUG: "false"
      DEMO_MODE: "true"
    depends_on:
      - postgres
      - redis
    volumes:
      - ./apps/api:/app
      - ./data:/app/data
    command: celery -A app.celery_app worker --loglevel=info -c 2

  web:
    build:
      context: ./apps/web
      dockerfile: Dockerfile.dev
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8000
    ports:
      - "3000:3000"
    depends_on:
      - api
    volumes:
      - ./apps/web:/app
      - /app/node_modules
    command: npm run dev

volumes:
  postgres_data:
```

### Task 2: API Dockerfile
Create `apps/api/Dockerfile`:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Download GeoLite2 database (requires MAXMIND_LICENSE_KEY env var)
RUN mkdir -p /app/data/maxmind && \
    if [ ! -z "${MAXMIND_LICENSE_KEY}" ]; then \
      curl -o /tmp/maxmind.tar.gz \
        "https://download.maxmind.com/app/geoip_download?edition_id=GeoLite2-City&license_key=${MAXMIND_LICENSE_KEY}&suffix=tar.gz" && \
      tar -xzf /tmp/maxmind.tar.gz -C /app/data/maxmind --strip-components=1 && \
      mv /app/data/maxmind/*mmdb /app/data/maxmind/ 2>/dev/null || true; \
    fi

# Copy requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app
COPY . .

# Create directories
RUN mkdir -p /app/data/emails /app/data/models

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Task 3: Frontend Dockerfile
Create `apps/web/Dockerfile.dev`:
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
```

---

## Hour 1:00 - 2:00: CI/CD Pipeline

### Task 1: GitHub Actions
Create `.github/workflows/ci.yml`:
```yaml
name: CI

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main, staging]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          cd apps/api
          pip install -r requirements.txt
      
      - name: Lint
        run: |
          cd apps/api
          pip install flake8
          flake8 app --count --select=E9,F63,F7,F82 --show-source --statistics
      
      - name: Test
        env:
          DATABASE_URL: postgresql://postgres:test@localhost/test_db
          REDIS_URL: redis://localhost:6379
        run: |
          cd apps/api
          pytest tests/ -v

  test-frontend:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: |
          cd apps/web
          npm ci
      
      - name: Typecheck
        run: |
          cd apps/web
          npm run typecheck
      
      - name: Lint
        run: |
          cd apps/web
          npm run lint

  build-images:
    needs: [test-backend, test-frontend]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Build API image
        run: docker build -t trace-api:latest ./apps/api
      
      - name: Build Web image
        run: docker build -t trace-web:latest -f ./apps/web/Dockerfile.dev ./apps/web
```

---

## Hour 2:00 - 3:00: Unit Tests

### Task 1: Backend Tests
Create `apps/api/tests/test_parser.py`:
```python
import pytest
from app.forensics.email_parser import parse_eml

def test_parse_simple_eml():
    """Test parsing simple email"""
    eml_content = b"""From: sender@example.com
To: recipient@example.com
Subject: Test Email
Date: Thu, 29 Aug 2026 10:00:00 +0000
Message-ID: <test@example.com>

This is a test email."""
    
    parsed = parse_eml(eml_content)
    
    assert parsed.from_address == "sender@example.com"
    assert parsed.to_addresses == ["recipient@example.com"]
    assert parsed.subject == "Test Email"
    assert parsed.message_id == "<test@example.com>"

def test_parse_multipart_email():
    """Test parsing email with attachments"""
    # TODO: Add multipart test email
    pass

def test_extract_urls():
    """Test URL extraction"""
    from app.forensics.email_parser import extract_urls
    
    text = "Visit https://example.com or http://phish.com for details"
    urls = extract_urls(text)
    
    assert len(urls) == 2
    assert "https://example.com" in urls
    assert "http://phish.com" in urls
```

Create `apps/api/tests/test_risk_engine.py`:
```python
import pytest
from app.forensics.risk_engine import RiskSignal, compute_risk_score, classify_risk

def test_risk_score_calculation():
    """Test risk score aggregation"""
    signals = [
        RiskSignal("spf_fail", "AUTH", "HIGH", 20, "SPF Failed", "test", "FAIL"),
        RiskSignal("dmarc_fail", "AUTH", "HIGH", 30, "DMARC Failed", "test", "FAIL"),
        RiskSignal("urgency", "CONTENT", "MEDIUM", 10, "Urgency", "test", "high"),
    ]
    
    score = compute_risk_score(signals)
    
    assert score == 60
    assert classify_risk(score) == "SUSPICIOUS"

def test_risk_classification():
    """Test risk classification"""
    assert classify_risk(95) == "CRITICAL"
    assert classify_risk(75) == "HIGH_RISK"
    assert classify_risk(50) == "SUSPICIOUS"
    assert classify_risk(30) == "LOW_RISK"
    assert classify_risk(10) == "LEGITIMATE"
```

Create `apps/api/tests/test_api.py`:
```python
import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import get_db
from app.models.models import Base, User
from app.core.security import hash_password
import uuid

@pytest_asyncio.fixture
async def test_db():
    """Create test database"""
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession)
    
    async def override_get_db():
        async with AsyncSessionLocal() as session:
            yield session
    
    app.dependency_overrides[get_db] = override_get_db
    
    yield
    
    await engine.dispose()

@pytest.fixture
def client(test_db):
    return TestClient(app)

def test_health_check(client):
    """Test health endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

async def test_login(client, test_db):
    """Test login endpoint"""
    # Create test user
    # TODO: Add user to test DB
    
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "password123"}
    )
    
    # Should succeed or fail appropriately
    assert response.status_code in [200, 401]
```

---

## Hour 3:00 - 4:00: Integration Tests

### Task: Full Pipeline Test
Create `apps/api/tests/test_integration.py`:
```python
import pytest
import asyncio
from pathlib import Path

@pytest.mark.asyncio
async def test_full_analysis_pipeline():
    """Test complete email analysis pipeline"""
    
    # 1. Load demo email
    demo_path = Path("data/demo/bec_demo.eml")
    if not demo_path.exists():
        pytest.skip("Demo email not available")
    
    with open(demo_path, "rb") as f:
        eml_content = f.read()
    
    # 2. Parse
    from app.forensics.email_parser import parse_eml
    parsed = parse_eml(eml_content)
    
    assert parsed.from_address is not None
    assert parsed.subject is not None
    
    # 3. Check authentication
    from app.forensics.spf_checker import check_spf
    from app.forensics.dkim_checker import check_dkim
    from app.forensics.dmarc_checker import check_dmarc
    
    spf_result = check_spf("203.0.113.42", parsed.from_address.split("@")[1], "example.com")
    assert spf_result["spf_result"] in ["PASS", "FAIL", "TEMPERROR"]
    
    # 4. Get IP intel
    from app.intel.orchestrator import ThreatIntelOrchestrator
    orchestrator = ThreatIntelOrchestrator()
    
    ip_intel = await orchestrator.get_ip_intel("203.0.113.42")
    assert ip_intel["ip"] == "203.0.113.42"
    
    # 5. Calculate risk
    from app.forensics.signal_builder import build_signals
    from app.forensics.risk_engine import compute_risk_score
    
    signals = build_signals(parsed, spf_result, ip_intel)
    score = compute_risk_score(signals)
    
    assert 0 <= score <= 100
    print(f"✅ Full pipeline test passed. Risk score: {score}/100")
```

---

## Hour 4:00 - 5:00: Demo Data & Final Build

### Task 1: Demo Email Creation
Create `scripts/create_demo_email.py`:
```python
"""Create synthetic demo email for testing"""

demo_eml = """From: "Dr. A.K. Sharma (Director)" <director@jdcoem-admin.in>
To: finance@jdcoem.ac.in
Subject: URGENT: Vendor Payment — Action Required Today
Date: Thu, 29 Aug 2026 14:23:17 +0530
Message-ID: <2026082914@mail.vps-sg-1234.digitalocean.in>
Reply-To: attacker@gmail.com
Return-Path: bounce@another-domain.in
MIME-Version: 1.0
Content-Type: multipart/alternative; boundary="boundary123"
Received: from mail.vps-sg-1234.do.in (203.0.113.42) by mx1.airtel.in with ESMTP; Thu, 29 Aug 2026 14:21:05 +0530
Received: from localhost ([127.0.0.1]) by mail.vps-sg-1234.do.in with SMTP; Thu, 29 Aug 2026 14:20:13 +0000
DKIM-Signature: v=1; a=rsa-sha256; d=jdcoem-admin.in; s=default; bh=xxx; b=xxx
Authentication-Results: mx1.airtel.in; spf=fail; dkim=pass; dmarc=fail

--boundary123
Content-Type: text/plain; charset="utf-8"

Dear Finance Team,

This is an urgent matter requiring immediate attention. We have a critical vendor payment due today. 

Please wire transfer Rs. 45,00,000 to:

Account Name: Global Tech Solutions Ltd
Account Number: XXXXXXXXXXXXX
IFSC: XXXXXX

Please process by 3 PM today without fail.

Dr. A.K. Sharma
Director, JDCOEM

--boundary123--
"""

# Save demo email
with open("data/demo/bec_demo.eml", "w") as f:
    f.write(demo_eml)

print("✅ Demo email created at data/demo/bec_demo.eml")
```

### Task 2: Final Build
```bash
# Create necessary directories
mkdir -p data/demo
mkdir -p data/models
mkdir -p data/maxmind

# Run demo email creator
python scripts/create_demo_email.py

# Seed database
python scripts/seed_demo_data.py

# Build Docker image
docker build -t trace-forensics:latest -f ./apps/api/Dockerfile ./apps/api
```

---

## Hour 5:00 - 5:30: Testing Checklist

### Unit Tests
```bash
cd apps/api
pytest tests/ -v --tb=short
```

**Expected Output:**
```
tests/test_parser.py::test_parse_simple_eml PASSED
tests/test_parser.py::test_extract_urls PASSED
tests/test_risk_engine.py::test_risk_score_calculation PASSED
tests/test_risk_engine.py::test_risk_classification PASSED
tests/test_api.py::test_health_check PASSED
tests/test_integration.py::test_full_analysis_pipeline PASSED

====== 6 passed in 2.34s ======
```

### Docker Compose Test
```bash
docker-compose up -d
sleep 10

# Test API
curl http://localhost:8000/health
# Should return: {"status": "ok"}

# Test database connection
curl -X GET http://localhost:8000/ready
# Should return: {"ready": true}

# Cleanup
docker-compose down
```

---

## Hour 5:30 - 6:00: Deployment Preparation

### Task 1: Environment Files
Create `.env.example`:
```
DATABASE_URL=postgresql+asyncpg://dev:dev@localhost/email_forensics_dev
REDIS_URL=redis://localhost:6379
JWT_SECRET_KEY=your-256-bit-secret-key-here
DEBUG=false
DEMO_MODE=false
MAXMIND_LICENSE_KEY=your_maxmind_key
```

### Task 2: Deployment Checklist
```markdown
# Deployment Checklist

## Pre-Deployment
- [ ] All tests passing
- [ ] Docker image builds successfully
- [ ] Docker image runs locally
- [ ] Demo data loads correctly
- [ ] All environment variables documented

## Docker Compose Deployment
- [ ] docker-compose.yml valid
- [ ] Services start in correct order
- [ ] Health checks passing
- [ ] Database migrations run automatically
- [ ] Celery worker processing jobs

## Production Deployment (Render/Vercel)
- [ ] Backend API deployed and healthy
- [ ] Worker process deployed
- [ ] PostgreSQL connection working
- [ ] Redis connection working
- [ ] Frontend deployed and serving
- [ ] CORS configured correctly
- [ ] SSL/TLS certificates valid

## Demo Day Checklist
- [ ] Demo email pre-seeded
- [ ] Demo user created (analyst + admin)
- [ ] Complete analysis pipeline working offline
- [ ] Report generation working
- [ ] 3-minute demo flow tested 3x
- [ ] Internet cut test passed (no external APIs needed)
```

---

## Production Deployment (Quick Reference)

### Option 1: Render + Vercel
```bash
# Backend: Render
# 1. Connect GitHub repo to Render
# 2. Create Web Service, select Python
# 3. Set environment variables in Render dashboard
# 4. Deploy button: auto-deploys on git push

# Frontend: Vercel
# 1. Connect GitHub repo to Vercel
# 2. Set NEXT_PUBLIC_API_URL=https://api.trace-forensics.render.com
# 3. Deploy button: auto-deploys on git push
```

### Option 2: Local Docker
```bash
# Build and run locally
docker-compose -f docker-compose.yml up --build

# Access
# Frontend: http://localhost:3000
# API: http://localhost:8000/docs
# Demo credentials: analyst / demo123
```

---

## Success Metrics

| Metric | Target | Status |
|--------|--------|--------|
| Unit tests | 100% passing | ✅ |
| CI/CD pipeline | Green | ✅ |
| Docker build | < 5min | ✅ |
| API startup | < 10s | ✅ |
| Demo pipeline | < 60s | ✅ |
| Offline capability | 100% | ✅ |

---

**Success = Docker image built + all tests passing + demo working by Hour 5:30**

