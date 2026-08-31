import os
from pathlib import Path
from pydantic_settings import BaseSettings
from typing import List, Optional

# Base directory for the API app
API_DIR = Path(__file__).resolve().parent.parent.parent
BASE_DIR = API_DIR.parent.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "TRACE Forensics"
    API_V1_STR: str = "/api/v1"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "Forensic Email Investigation & Threat Correlation Platform (SIH 2026 PS 26106)"
    
    # Database Configuration (Defaults to SQLite for instant offline demo, supports PostgreSQL)
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        f"sqlite+aiosqlite:///{API_DIR}/data/trace.db"
    )
    
    # Redis / Celery Configuration (Optional, falls back to in-memory/in-process pipeline)
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    USE_CELERY: bool = os.getenv("USE_CELERY", "false").lower() == "true"
    
    # Security / JWT
    JWT_SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "trace-sih-2026-ultra-secure-secret-key-32chars-min!")
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # CORS Origins
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://trace-forensics.vercel.app",
        "*"
    ]
    
    # File Storage
    STORAGE_DIR: Path = API_DIR / "data" / "emails"
    MAX_FILE_SIZE_BYTES: int = 25 * 1024 * 1024  # 25MB
    
    # Demo & Intel mode
    DEMO_MODE: bool = True
    DEBUG: bool = True

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()

# Ensure storage directory exists
settings.STORAGE_DIR.mkdir(parents=True, exist_ok=True)
(API_DIR / "data").mkdir(parents=True, exist_ok=True)
