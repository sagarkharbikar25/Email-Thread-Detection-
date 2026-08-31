from typing import Dict, Any, Optional
import httpx
import logging

logger = logging.getLogger("trace.intel")

# Pre-populated demo intelligence lookup table for offline hackathon presentations
DEMO_IP_DATABASE: Dict[str, Dict[str, Any]] = {
    "185.220.101.5": {
        "ip": "185.220.101.5",
        "country_code": "DE",
        "country_name": "Germany",
        "region": "Hesse",
        "city": "Frankfurt am Main",
        "latitude": 50.1109,
        "longitude": 8.6821,
        "isp": "Zwiebelfreunde e.V.",
        "asn": "AS200651",
        "is_vpn": False,
        "is_tor": True,
        "is_proxy": True,
        "is_hosting": True,
        "abuse_score": 95,
        "reputation": "MALICIOUS",
        "geo_source": "DEMO_INTEL"
    },
    "194.26.29.112": {
        "ip": "194.26.29.112",
        "country_code": "RU",
        "country_name": "Russia",
        "region": "Moscow",
        "city": "Moscow",
        "latitude": 55.7558,
        "longitude": 37.6173,
        "isp": "Hostkey B.V. Bulletproof",
        "asn": "AS57043",
        "is_vpn": True,
        "is_tor": False,
        "is_proxy": True,
        "is_hosting": True,
        "abuse_score": 88,
        "reputation": "MALICIOUS",
        "geo_source": "DEMO_INTEL"
    },
    "142.250.190.46": {
        "ip": "142.250.190.46",
        "country_code": "US",
        "country_name": "United States",
        "region": "California",
        "city": "Mountain View",
        "latitude": 37.4220,
        "longitude": -122.0841,
        "isp": "Google LLC",
        "asn": "AS15169",
        "is_vpn": False,
        "is_tor": False,
        "is_proxy": False,
        "is_hosting": True,
        "abuse_score": 0,
        "reputation": "CLEAN",
        "geo_source": "DEMO_INTEL"
    },
    "40.92.74.88": {
        "ip": "40.92.74.88",
        "country_code": "US",
        "country_name": "United States",
        "region": "Washington",
        "city": "Redmond",
        "latitude": 47.6740,
        "longitude": -122.1215,
        "isp": "Microsoft Corporation",
        "asn": "AS8075",
        "is_vpn": False,
        "is_tor": False,
        "is_proxy": False,
        "is_hosting": True,
        "abuse_score": 0,
        "reputation": "CLEAN",
        "geo_source": "DEMO_INTEL"
    },
    "103.151.125.44": {
        "ip": "103.151.125.44",
        "country_code": "IN",
        "country_name": "India",
        "region": "Delhi",
        "city": "New Delhi",
        "latitude": 28.6139,
        "longitude": 77.2090,
        "isp": "National Informatics Centre",
        "asn": "AS55836",
        "is_vpn": False,
        "is_tor": False,
        "is_proxy": False,
        "is_hosting": False,
        "abuse_score": 2,
        "reputation": "CLEAN",
        "geo_source": "DEMO_INTEL"
    }
}

async def get_ip_intel(ip_address: Optional[str]) -> Dict[str, Any]:
    """Retrieve GeoIP and threat reputation intelligence for an IP."""
    if not ip_address:
        return _fallback_ip_data("0.0.0.0")
        
    # Check demo database first for instant lookup
    if ip_address in DEMO_IP_DATABASE:
        return DEMO_IP_DATABASE[ip_address].copy()
        
    # Check private IP ranges
    if ip_address.startswith(("10.", "172.16.", "192.168.", "127.", "0.")):
        return {
            "ip": ip_address,
            "country_code": "LOCAL",
            "country_name": "Private Network",
            "region": "Internal",
            "city": "Intranet",
            "latitude": 0.0,
            "longitude": 0.0,
            "isp": "Internal Gateway",
            "asn": "RFC1918",
            "is_vpn": False,
            "is_tor": False,
            "is_proxy": False,
            "is_hosting": False,
            "abuse_score": 0,
            "reputation": "CLEAN",
            "geo_source": "LOCAL_NETWORK"
        }

    # Attempt live query with timeout fallback
    try:
        async with httpx.AsyncClient(timeout=1.5) as client:
            resp = await client.get(f"http://ip-api.com/json/{ip_address}?fields=status,country,countryCode,regionName,city,lat,lon,isp,as,hosting")
            if resp.status_code == 200:
                data = resp.json()
                if data.get("status") == "success":
                    return {
                        "ip": ip_address,
                        "country_code": data.get("countryCode", "UN"),
                        "country_name": data.get("country", "Unknown"),
                        "region": data.get("regionName", "Unknown"),
                        "city": data.get("city", "Unknown"),
                        "latitude": float(data.get("lat", 0.0)),
                        "longitude": float(data.get("lon", 0.0)),
                        "isp": data.get("isp", "Unknown ISP"),
                        "asn": data.get("as", "Unknown ASN"),
                        "is_vpn": False,
                        "is_tor": False,
                        "is_proxy": False,
                        "is_hosting": bool(data.get("hosting", False)),
                        "abuse_score": 10 if data.get("hosting") else 0,
                        "reputation": "SUSPICIOUS" if data.get("hosting") else "CLEAN",
                        "geo_source": "LIVE_API"
                    }
    except Exception as e:
        logger.warning(f"Live IP lookup failed for {ip_address}: {e}")

    # Default fallback
    return _fallback_ip_data(ip_address)

def _fallback_ip_data(ip: str) -> Dict[str, Any]:
    return {
        "ip": ip,
        "country_code": "US",
        "country_name": "United States",
        "region": "California",
        "city": "San Jose",
        "latitude": 37.3382,
        "longitude": -121.8863,
        "isp": "Cloud Relay Network",
        "asn": "AS13335",
        "is_vpn": False,
        "is_tor": False,
        "is_proxy": False,
        "is_hosting": True,
        "abuse_score": 15,
        "reputation": "UNKNOWN",
        "geo_source": "DEMO_FALLBACK"
    }
