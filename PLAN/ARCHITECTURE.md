# TRACE Platform - Architecture Blueprint
## SIH 2026 PS 26106 | 6-Hour Build Sprint

**Status: READY FOR EXECUTION**  
**Timeline: 6 hours | Team: 6 people | Deployment: Demo mode (offline-first)**

---

## Executive Summary

You are building a **forensic email investigation platform**, not a spam filter.

**Core Value Chain:**  
`INGEST → PARSE → ANALYZE → CORRELATE → INVESTIGATE → PRESERVE → REPORT`

**Success Criteria (6-hour MVP):**
- ✅ Upload .eml → see complete analysis within 60 seconds
- ✅ Risk score (0-100) with labeled signal breakdown
- ✅ SPF/DKIM/DMARC authentication verification
- ✅ Relay path reconstruction with geolocation
- ✅ Threat graph visualization
- ✅ PDF forensic report generation
- ✅ Evidence integrity (SHA-256)
- ✅ Demo mode works completely offline
- ✅ Non-technical judge understands findings in 2 minutes

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      ANALYST BROWSER                            │
│                    (Next.js React App)                          │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS REST
                         ▼
        ┌────────────────────────────────┐
        │      FastAPI Backend           │
        │      (Python 3.11+)            │
        │   Async + Pydantic v2          │
        └─┬──────────────────────────────┤
          │                              │
          ▼                              ▼
   ┌────────────────┐         ┌──────────────────┐
   │  PostgreSQL    │         │      Redis       │
   │  (Neon Free)   │         │  (Upstash Free)  │
   └────────────────┘         └──────────────────┘
          │                              │
          └───────────┬──────────────────┘
                      ▼
        ┌────────────────────────────────┐
        │    Celery Workers              │
        │   (Background Analysis Jobs)   │
        └───┬────────────────────────────┘
            │
    ┌───────┼───────┬───────────┐
    ▼       ▼       ▼           ▼
┌────────┬────────┬──────────┬──────────┐
│ Email  │Threat  │   AI/ML  │ Risk &   │
│Parser  │Intel   │Classifier│Correlation│
└────────┴────────┴──────────┴──────────┘
    │       │        │          │
    └───────┴────────┴──────────┘
            ▼
    ┌────────────────────┐
    │  Analysis Result   │
    │  Stored to DB      │
    └────────┬───────────┘
             ▼
    ┌────────────────────┐
    │   Frontend Display │
    │   (React Flow,     │
    │    Maps, Reports)  │
    └────────────────────┘
```

### Component Responsibilities

| Component | Owner | Tech Stack | Purpose |
|-----------|-------|-----------|---------|
| **FastAPI Backend** | P1 (Tech Lead) | FastAPI, Pydantic v2, SQLAlchemy async | REST API, core orchestration |
| **Email Parser** | P2 (Security) | Python stdlib `email`, dnspython | RFC 5322 parsing, header extraction |
| **Auth Verification** | P2 (Security) | pyspf, dkimpy, authheaders | SPF/DKIM/DMARC checking |
| **Threat Intel** | P4 (Data) | ip-api.com, MaxMind GeoLite2, mock providers | IP/domain enrichment with fallbacks |
| **ML/Risk Engine** | P3 (AI/ML) | scikit-learn LightGBM | Phishing classifier + risk aggregation |
| **Correlation** | P4 (Data) + P1 (Tech Lead) | NetworkX | Graph building + campaign detection |
| **Frontend** | P5 (Frontend) | Next.js, React, Tailwind, React Flow, MapLibre | Web UI, visualization |
| **Database** | P1 + P6 | PostgreSQL async + Alembic | Relational schema, audit trail |
| **Workers** | P6 (DevOps) | Celery + Redis | Async job processing |
| **Deployment** | P6 (DevOps) | Docker, Vercel, Render | Containerization + cloud deployment |

---

## Technology Stack (6-Hour Constraints)

### Backend
```
FastAPI 0.111+          → async REST API with auto-OpenAPI
Pydantic v2             → strict input validation
SQLAlchemy 2.x async    → async ORM for DB access
Celery 5.x              → background job processing
Redis                   → job queue + cache
PostgreSQL              → relational database

Email Analysis:
  - email (stdlib)      → RFC 5322 parsing
  - dnspython           → DNS/SPF/DMARC lookups
  - dkimpy              → DKIM verification
  - python-whois        → domain WHOIS lookup

ML/Risk:
  - scikit-learn        → phishing classifier (LightGBM)
  - networkx            → threat graph correlation

PDF:
  - WeasyPrint          → HTML to PDF conversion
  - Jinja2              → report templating
```

### Frontend
```
Next.js 14+ (App Router) → React framework
TypeScript              → type safety
Tailwind CSS 3.x        → styling
shadcn/ui              → base components
Lucide Icons           → icon system
React Flow 11.x        → threat graph visualization
MapLibre GL JS 4.x     → geolocation mapping
Recharts               → charts
TanStack Query 5.x     → server state management
```

### Infrastructure
```
Database: PostgreSQL (Neon free tier)
Cache: Redis (Upstash free tier)
Storage: Local filesystem (Docker volume) OR Cloudflare R2
API: FastAPI on Render.com OR Railway
Worker: Celery on Render worker
Frontend: Vercel
```

---

## Database Schema (Minimal for 6-hour MVP)

```sql
-- Users & Auth
users (id, email, username, password_hash, role, is_active, created_at)

-- Core email data
emails (id, sha256, filename, from_address, subject, received_at, analysis_status, risk_score, classification)
email_headers (id, email_id, name, value, position)
received_hops (id, email_id, hop_order, ip_address, timestamp, hop_type)

-- Authentication results
authentication_results (id, email_id, spf_result, dkim_result, dmarc_result, spf_alignment, dkim_alignment)

-- Intelligence
ip_addresses (id, ip, country_code, city, latitude, longitude, asn, is_vpn, is_tor, reputation, geo_source)
domains (id, domain, lookalike_score, reputation, domain_age_days)
urls (id, email_id, url_raw, domain_id, threat_type)

-- Analysis
analysis_results (id, email_id, risk_score, classification, signals (JSONB), origin_assessment, graph_data (JSONB))

-- Cases & Evidence
cases (id, case_number, title, severity, status, created_by, created_at)
evidence (id, evidence_id, case_id, email_id, sha256, uploaded_by, uploaded_at)
chain_of_custody_events (id, evidence_id, action, actor_id, timestamp) -- APPEND-ONLY

-- Campaign
campaigns (id, campaign_id, name, email_count, first_seen, last_seen)
relationships (id, from_type, from_id, to_type, to_id, relationship, confidence)

-- Reports & Audit
reports (id, case_id, generated_by, storage_path, sha256, generated_at)
audit_logs (id, actor_id, action, resource_type, resource_id, timestamp)
```

---

## 6-Hour Sprint Timeline

### Hour 0:00 - 0:30: Setup & Coordination
- **P1 (Tech Lead)**: Clone repo, create folder structure, start FastAPI skeleton
- **P6 (DevOps)**: Docker Compose file, GitHub Actions CI stub
- **Everyone**: Read this document, understand your role

### Hour 0:30 - 1:30: Foundation Layer
- **P1**: Database schema created, first Alembic migration, SQLAlchemy models
- **P2**: JWT auth endpoints working (login, refresh, me)
- **P5**: Next.js setup, navigation shell, login page
- **P6**: Celery worker connection to Redis, health checks

### Hour 1:30 - 2:30: Email Ingestion & Parsing
- **P1**: POST /api/v1/emails/upload endpoint, SHA-256 computation
- **P2**: Email parser (stdlib), header extraction, Received chain parsing
- **P5**: File upload page (drag & drop), progress indicator
- **P4**: IP extraction from Received headers

### Hour 2:30 - 3:30: Authentication Verification & Intelligence
- **P2**: SPF checker (pyspf), DKIM checker (dkimpy), DMARC DNS lookup
- **P4**: GeoLite2 provider (offline), MaxMind database bundled
- **P5**: Headers page, Authentication page, Relay Trace page
- **P3**: Feature extraction pipeline setup

### Hour 3:30 - 4:30: ML & Risk Engine
- **P3**: LightGBM classifier inference + feature extraction
- **P1**: Risk engine (weighted signals), origin assessment logic
- **P1**: Correlation graph builder (NetworkX)
- **P5**: Risk Assessment panel, Threat Graph page (React Flow)

### Hour 4:30 - 5:30: Cases, Evidence & Reports
- **P1**: Case management endpoints (CRUD)
- **P2**: Evidence integrity verification (SHA-256 recompute)
- **P6**: WeasyPrint PDF report generation worker
- **P5**: Case management page, Evidence page, Report Builder page
- **P4**: Campaign detection, demo data seeding

### Hour 5:30 - 6:00: Demo & Polish
- **P6**: Docker image built, Vercel/Render deployment
- **Everyone**: Run complete demo 3 times, note bugs
- **P1**: Demo data loaded, pre-seeded cases available
- **P5**: Fix UI bugs, ensure all flows work
- **P2**: Security audit checklist (OWASP top 10)

---

## API Endpoint Contract (Must implement by Hour 4)

```
POST   /api/v1/auth/login              → { access_token, refresh_token }
POST   /api/v1/emails/upload           → { email_id, job_id, sha256, status }
GET    /api/v1/jobs/{id}               → { status, progress, current_step, error }
GET    /api/v1/emails/{id}             → { full email + analysis result }
GET    /api/v1/emails/{id}/headers     → { parsed headers + anomalies }
GET    /api/v1/emails/{id}/authentication → { SPF, DKIM, DMARC results }
GET    /api/v1/emails/{id}/trace       → { relay hops with geolocation }
GET    /api/v1/emails/{id}/intelligence → { IP intel + domain intel }
GET    /api/v1/emails/{id}/risk        → { risk_score + signals with reasons }
GET    /api/v1/emails/{id}/graph       → { React Flow nodes/edges }

POST   /api/v1/cases                   → { case_id, case_number }
GET    /api/v1/cases/{id}              → { case detail + linked evidence }
PATCH  /api/v1/cases/{id}              → { updated case }

GET    /api/v1/evidence/{id}           → { evidence detail }
POST   /api/v1/evidence/{id}/verify    → { integrity: VERIFIED|FAILED }

POST   /api/v1/reports/generate        → { report_id, job_id }
GET    /api/v1/reports/{id}/download   → PDF file download

GET    /health                         → { status: "ok" }
```

---

## Judge Presentation (3-minute demo sequence)

```
0:00 - 0:15  [INGESTION]     Upload .eml file → SHA-256 appears
0:15 - 0:35  [PROGRESS]      Show analysis pipeline stages (PARSING → ANALYSIS)
0:35 - 1:00  [OVERVIEW]      Risk score 91/CRITICAL, BEC classification
1:00 - 1:15  [AUTH]          Show DMARC FAIL explanation
1:15 - 1:35  [TRACE]         Relay path: Singapore → Mumbai → Pune
1:35 - 1:50  [GRAPH]         Threat graph showing email → IP → ASN
1:50 - 2:00  [CASE + REPORT] Create case → generate PDF
2:00 - 3:00  [Q&A]           Answer judge questions
```

---

## Critical Do's and Don'ts

### ✅ DO
- Write code assuming network can be unavailable
- Bundle all necessary data (GeoLite2, ML model) in Docker image
- Test each component with **offline mock providers**
- Use synchronous API responses for critical paths (don't make judges wait)
- Log everything — audit trail is your evidence
- Use Pydantic for ALL input validation
- Keep UI simple — focus on clarity over polish

### ❌ DON'T
- Don't call external APIs during demo without fallback
- Don't store secrets in code — use environment variables
- Don't skip database migrations — use Alembic
- Don't write SQL by hand — use SQLAlchemy ORM
- Don't trust email headers — validate everything
- Don't use LLMs for analysis (too slow, too unreliable)
- Don't make judges wait more than 60 seconds for analysis

---

## Success Metrics

| Metric | Target | Owner |
|--------|--------|-------|
| Upload to analysis complete | < 60 seconds | P1 + P6 |
| API response time | < 200ms | P1 |
| Risk score accuracy | F1 > 0.75 | P3 |
| False positive rate | < 20% | P3 |
| Report generation | < 15 seconds | P6 |
| UI loads | < 2 seconds | P5 |
| Demo completeness | All 7 steps | Everyone |
| Zero external API dependencies | 100% offline | P4 |

---

## Emergency Troubleshooting

| Problem | Solution |
|---------|----------|
| Database connection fails | Use local SQLite + Docker Compose for postgres service |
| API takes >60s | Move heavy work to Celery background job, show progress |
| ML model missing | Fall back to rule-based classification (urgency + keywords) |
| PDF generation fails | Return HTML version instead of PDF |
| Frontend can't reach API | Check CORS headers, verify API_URL environment variable |
| GeoLite2 database missing | Download during Docker build script (done automatically) |
| Celery worker crashes | Implement 3-retry logic with exponential backoff |

---

## Deployment Commands (Last 15 minutes)

```bash
# Build Docker image
docker build -t trace-forensics .

# Run locally
docker-compose up

# Deploy to Render (backend)
git push origin main  # Render auto-deploys on push

# Deploy to Vercel (frontend)
# Connect GitHub repo to Vercel, auto-deploys on push

# Test production
curl https://api.trace-forensics.render.com/health
# Should return: {"status": "ok"}
```

---

## Hand-Off Checklist

**P1 → P6**: Database is ready, API structure defined
**P2 → P1**: Auth working, can be integrated everywhere  
**P4 → P1**: Providers working, data structure defined  
**P3 → P1**: ML model packaged, inference ready  
**P1 → P5**: API endpoints ready, type definitions exported  
**P5 → P6**: Frontend built, deployment ready  
**P6 → Everyone**: Docker image ready, demo mode configured  

---

## Commit Convention (Keep Git Clean)

```
feat(parser): add RFC 5322 email parsing
fix(api): handle malformed Received headers
test(ml): add LightGBM evaluation
docs(api): update authentication schema
chore(docker): add GeoLite2 download
```

---

## Key Numbers to Know

- **Max .eml size**: 25 MB
- **JWT token lifetime**: 1 hour access, 7 days refresh
- **Analysis timeout**: 90 seconds (60s ideal)
- **Risk score range**: 0-100
- **Confidence ranges**: 0-100 (percentage)
- **ML feature count**: 40+ engineered features
- **Report sections**: 23 (but only 12 for 6-hour MVP)
- **Demo email risk score**: Target 85-95 (CRITICAL)

---

**Questions? Ask in Slack. Blockers? Escalate to P1 immediately. Go build.** 🚀

