from app.core.config import settings
import logging

logger = logging.getLogger("trace.celery")

# Optional Celery setup with fallback
try:
    from celery import Celery
    celery_app = Celery(
        "trace_forensics",
        broker=settings.REDIS_URL,
        backend=settings.REDIS_URL
    )
    celery_app.conf.update(
        task_serializer="json",
        accept_content=["json"],
        result_serializer="json",
        timezone="UTC",
        enable_utc=True,
    )
except Exception as e:
    celery_app = None
    logger.info("Running without Celery (using in-process async orchestrator).")
