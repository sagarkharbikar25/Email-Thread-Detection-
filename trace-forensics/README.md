# TRACE Forensics Platform 🛡️
## Forensic Email Investigation & Threat Correlation System
**SIH 2026 Problem Statement PS 26106**

---

## 🌟 Executive Summary
**TRACE** is an enterprise-grade forensic email investigation and threat analysis platform. Unlike generic spam filters, TRACE conducts full forensic header decomposition, multi-hop relay route reconstruction, cryptographic SPF/DKIM/DMARC authentication verification, threat intelligence enrichment, heuristic risk scoring, and interactive threat graph correlation.

---

## 🏛️ Architecture & Component Overview

```
                          ┌───────────────────────────┐
                          │   Analyst Web Dashboard   │
                          │   (React / Next.js / UI)  │
                          └─────────────┬─────────────┘
                                        │ HTTPS / REST
                                        ▼
                          ┌───────────────────────────┐
                          │     FastAPI Backend       │
                          │  (Async SQLAlchemy / ORM) │
                          └──────┬─────────────┬──────┘
                                 │             │
                    ┌────────────▼──┐       ┌──▼────────────┐
                    │ SQLite/Postgres│      │ Redis / Queue │
                    │ (Forensic DB) │       │ (Celery/Async)│
                    └───────────────┘       └───────────────┘
                                 │
           ┌─────────────────────┼─────────────────────┐
           ▼                     ▼                     ▼
┌────────────────────┐ ┌────────────────────┐ ┌────────────────────┐
│ RFC 5322 Parser    │ │ Auth & SPF/DKIM    │ │ Threat Intel & Geo │
│ • Header Breakdown │ │ • Alignment Check  │ │ • Tor/VPN/Proxy    │
│ • Relay Hops Map   │ │ • DMARC Policy     │ │ • Abuse IP Lookup  │
└────────────────────┘ └────────────────────┘ └────────────────────┘
           │                     │                     │
           └─────────────────────┼─────────────────────┘
                                 ▼
                    ┌──────────────────────────┐
                    │ Risk & Correlation Engine│
                    │ • 0-100 Forensic Score   │
                    │ • React Flow Graph Export│
                    └──────────────────────────┘
```

---

## 📂 Project Structure

```
trace-forensics/
├── apps/
│   ├── api/                     # FastAPI Backend Core
│   │   ├── app/
│   │   │   ├── api/             # API Routers (auth, emails, cases, evidence)
│   │   │   ├── core/            # Config, Async DB Engine, Security & JWT
│   │   │   ├── correlation/     # NetworkX Threat Graph Generator
│   │   │   ├── forensics/       # RFC 5322 parser, SPF/DKIM verifier, Risk engine
│   │   │   ├── intel/           # Threat Intel & GeoIP Provider with demo mode
│   │   │   ├── models/          # SQLAlchemy async ORM models
│   │   │   ├── schemas/         # Pydantic v2 validation models
│   │   │   ├── celery_app.py    # Optional Celery worker app
│   │   │   └── tasks.py         # 7-step analysis pipeline orchestrator
│   │   ├── main.py              # Application entry point with CORS & Lifespan
│   │   └── requirements.txt     # Pinned dependencies
├── data/
│   ├── demo/                    # Pre-curated sample EML files (phishing, BEC, legit)
│   └── emails/                  # Storage repository for raw .eml evidence
├── scripts/
│   ├── seed_db.py               # Database seeder & demo ingest script
│   └── test_pipeline.py         # Standalone test & verification runner
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```bash
cd apps/api
pip install -r requirements.txt
```

### 2. Seed Database & Ingest Demo Emails
```bash
python scripts/seed_db.py
```

### 3. Run FastAPI Backend
```bash
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
- Interactive API Docs: `http://localhost:8000/docs`
- Redoc API Docs: `http://localhost:8000/redoc`
- Health Check: `http://localhost:8000/health`

---

## 📡 Key API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/emails/upload` | Upload `.eml` file, compute SHA-256 hash, run 7-step forensic pipeline |
| `GET` | `/api/v1/emails` | List all ingested emails with summary risk scores |
| `GET` | `/api/v1/emails/{id}` | Complete forensic report (hops, auth, signals, risk score, origin assessment) |
| `GET` | `/api/v1/emails/{id}/graph` | React Flow formatted threat infrastructure graph |
| `GET` | `/api/v1/emails/{id}/raw` | View raw RFC 5322 `.eml` source |
| `POST` | `/api/v1/cases` | Create new investigation case |
| `GET` | `/api/v1/cases` | List cases with status/severity filters |
| `POST` | `/api/v1/cases/{case_id}/emails/{email_id}` | Link analyzed email to case |
| `GET` | `/api/v1/evidence` | List digital evidence items |
| `POST` | `/api/v1/evidence/{id}/verify` | Cryptographic SHA-256 tamper verification & chain of custody |
| `POST` | `/api/v1/auth/login` | Investigator & Analyst authentication (JWT) |

---

## 🔒 Chain of Custody & Evidence Preservation
Every uploaded `.eml` has its SHA-256 cryptographic digest calculated immediately upon ingest. All forensic actions (ingest, verify, update, export) are logged as immutable `ChainOfCustodyEvent` entries for court admissibility and audit compliance.
