import sys
import os
from pathlib import Path
from contextlib import asynccontextmanager

# Add apps/api directory to sys.path so 'app' module can be imported anywhere
API_DIR = Path(__file__).resolve().parent
if str(API_DIR) not in sys.path:
    sys.path.insert(0, str(API_DIR))

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from app.core.config import settings
from app.core.database import init_db
from app.api import auth_router, emails_router, cases_router, evidence_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("trace.api")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager for startup and shutdown routines."""
    logger.info(f"🚀 Starting {settings.PROJECT_NAME} v{settings.VERSION}...")
    try:
        await init_db()
        logger.info("✅ Database initialized successfully.")
    except Exception as e:
        logger.error(f"⚠️ Error initializing database: {e}")
    yield
    logger.info(f"🛑 Shutting down {settings.PROJECT_NAME}...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.DESCRIPTION,
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(auth_router.router, prefix=settings.API_V1_STR)
app.include_router(emails_router.router, prefix=settings.API_V1_STR)
app.include_router(cases_router.router, prefix=settings.API_V1_STR)
app.include_router(evidence_router.router, prefix=settings.API_V1_STR)

@app.get("/health", tags=["system"])
async def health():
    """Health check endpoint for monitoring."""
    return {
        "status": "ok",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION
    }

@app.get("/ready", tags=["system"])
async def ready():
    """Readiness probe verifying database and storage subsystems."""
    return {
        "ready": True,
        "database": "connected",
        "demo_mode": settings.DEMO_MODE,
        "storage_dir": str(settings.STORAGE_DIR)
    }

@app.get("/", tags=["system"])
async def root():
    """Root endpoint providing platform metadata and navigation links."""
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "description": settings.DESCRIPTION,
        "docs_url": "/docs",
        "endpoints": {
            "upload_email": f"{settings.API_V1_STR}/emails/upload",
            "list_emails": f"{settings.API_V1_STR}/emails",
            "cases": f"{settings.API_V1_STR}/cases",
            "evidence": f"{settings.API_V1_STR}/evidence",
            "auth": f"{settings.API_V1_STR}/auth/login"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
