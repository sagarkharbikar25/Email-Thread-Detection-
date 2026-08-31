import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

MOCK_IPS = {
    "203.0.113.42": {
        "country_code": "SG",
        "country_name": "Singapore",
        "city": "Singapore",
        "latitude": "1.3521",
        "longitude": "103.8198",
        "asn": "AS14061",
        "isp": "DigitalOcean",
        "is_hosting": True,
        "reputation": "SUSPICIOUS",
    },
    "198.51.100.5": {
        "country_code": "IN",
        "country_name": "India",
        "city": "Mumbai",
        "latitude": "19.0760",
        "longitude": "72.8777",
        "asn": "AS9498",
        "isp": "Bharti Airtel",
        "is_hosting": False,
        "reputation": "CLEAN",
    },
}


class MockIntelProvider:
    async def get_ip_intel(self, ip: str) -> Dict[str, Any]:
        if ip in MOCK_IPS:
            data = MOCK_IPS[ip]
            return {
                "ip": ip,
                "country_code": data.get("country_code"),
                "country_name": data.get("country_name"),
                "region": data.get("region"),
                "city": data.get("city"),
                "latitude": data.get("latitude"),
                "longitude": data.get("longitude"),
                "asn": data.get("asn"),
                "isp": data.get("isp"),
                "is_vpn": False,
                "is_tor": False,
                "is_proxy": False,
                "is_hosting": data.get("is_hosting", False),
                "abuse_score": 80 if data.get("reputation") == "SUSPICIOUS" else 0,
                "reputation": data.get("reputation", "UNKNOWN"),
                "geo_source": "DEMO",
            }

        return {
            "ip": ip,
            "country_code": None,
            "country_name": None,
            "region": None,
            "city": None,
            "latitude": None,
            "longitude": None,
            "asn": None,
            "isp": None,
            "is_vpn": False,
            "is_tor": False,
            "is_proxy": False,
            "is_hosting": False,
            "abuse_score": 0,
            "reputation": "UNKNOWN",
            "geo_source": "DEMO_FALLBACK",
        }

    def is_available(self) -> bool:
        return True
