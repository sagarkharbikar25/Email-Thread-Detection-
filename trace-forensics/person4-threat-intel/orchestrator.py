import json
import logging
from typing import Any, Dict, Optional

from maxmind_provider import MaxMindGeoIP2Provider
from mock_provider import MockIntelProvider

logger = logging.getLogger(__name__)


class ThreatIntelOrchestrator:
    def __init__(self, redis_client: Optional[Any] = None, db_session: Optional[Any] = None):
        self.redis = redis_client
        self.db = db_session
        self.providers = [
            MaxMindGeoIP2Provider(),
            MockIntelProvider(),
        ]

    async def get_ip_intel(self, ip: str) -> Dict[str, Any]:
        if not ip:
            return {"ip": "", "reputation": "UNKNOWN", "geo_source": "UNAVAILABLE"}

        if self.redis:
            try:
                cached = await self.redis.get(f"ip_intel:{ip}")
                if cached:
                    if isinstance(cached, (bytes, bytearray)):
                        cached = cached.decode("utf-8")
                    if isinstance(cached, str):
                        cached = json.loads(cached)
                    logger.info("📦 IP intel cache hit: %s", ip)
                    return cached
            except Exception as exc:
                logger.warning("Redis cache lookup failed for %s: %s", ip, exc)

        for provider in self.providers:
            if not provider.is_available():
                continue
            try:
                result = await provider.get_ip_intel(ip)
                if self.redis:
                    try:
                        await self.redis.setex(f"ip_intel:{ip}", 3600, json.dumps(result, default=str))
                    except Exception as exc:
                        logger.warning("Redis cache write failed for %s: %s", ip, exc)
                if self.db and hasattr(self.db, "upsert_ip"):
                    try:
                        await self.db.upsert_ip(ip, result)
                    except Exception as exc:
                        logger.warning("DB upsert failed for %s: %s", ip, exc)
                return result
            except Exception as exc:
                logger.warning("Provider %s failed: %s", provider.__class__.__name__, exc)
                continue

        return {"ip": ip, "reputation": "UNKNOWN", "geo_source": "UNAVAILABLE"}

    async def get_domain_intel(self, domain: str) -> Dict[str, Any]:
        return {
            "domain": domain,
            "lookalike_score": 0.0,
            "age_days": -1,
            "reputation": "UNKNOWN",
        }
