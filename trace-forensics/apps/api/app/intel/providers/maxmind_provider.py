import logging
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

try:
    import geoip2.database
except ImportError:  # pragma: no cover - optional dependency for offline demo mode
    geoip2 = None


class MaxMindGeoIP2Provider:
    def __init__(self, db_path: str = "data/maxmind/GeoLite2-City.mmdb"):
        self.db_path = db_path
        self.reader = None
        self._load_database()

    def _load_database(self) -> None:
        if geoip2 is None:
            logger.warning("geoip2 is not installed; MaxMind provider unavailable.")
            self.reader = None
            return

        try:
            self.reader = geoip2.database.Reader(self.db_path)
            logger.info("✅ GeoLite2 database loaded: %s", self.db_path)
        except Exception as exc:  # pragma: no cover - database may not be present in demo builds
            logger.warning("❌ Failed to load GeoLite2: %s", exc)
            self.reader = None

    async def get_ip_intel(self, ip: Optional[str]) -> Dict[str, Any]:
        if not ip:
            return self._unknown_result("0.0.0.0")

        if not self.reader:
            return self._unknown_result(ip)

        try:
            response = self.reader.city(ip)
            subdivision = response.subdivisions[0].name if getattr(response, "subdivisions", None) else None
            return {
                "ip": ip,
                "country_code": getattr(getattr(response, "country", None), "iso_code", None),
                "country_name": getattr(getattr(response, "country", None), "name", None),
                "region": subdivision,
                "city": getattr(getattr(response, "city", None), "name", None),
                "latitude": str(getattr(getattr(response, "location", None), "latitude", None)) if getattr(response, "location", None) else None,
                "longitude": str(getattr(getattr(response, "location", None), "longitude", None)) if getattr(response, "location", None) else None,
                "isp": None,
                "asn": None,
                "is_vpn": False,
                "is_tor": False,
                "is_proxy": False,
                "is_hosting": False,
                "abuse_score": None,
                "reputation": "UNKNOWN",
                "geo_source": "MAXMIND_LOCAL",
            }
        except Exception as exc:
            logger.warning("Geolocation lookup failed for %s: %s", ip, exc)
            return self._unknown_result(ip)

    def _unknown_result(self, ip: str) -> Dict[str, Any]:
        return {
            "ip": ip,
            "country_code": None,
            "country_name": None,
            "region": None,
            "city": None,
            "latitude": None,
            "longitude": None,
            "isp": None,
            "asn": None,
            "is_vpn": False,
            "is_tor": False,
            "is_proxy": False,
            "is_hosting": False,
            "abuse_score": 0,
            "reputation": "UNKNOWN",
            "geo_source": "UNAVAILABLE",
        }

    def is_available(self) -> bool:
        return self.reader is not None
