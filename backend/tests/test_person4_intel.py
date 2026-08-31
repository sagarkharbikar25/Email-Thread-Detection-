import asyncio
import sys
from pathlib import Path
import unittest

API_DIR = Path(__file__).resolve().parents[1]
if str(API_DIR) not in sys.path:
    sys.path.insert(0, str(API_DIR))

from app.intel.providers.mock_provider import MockIntelProvider
from app.intel.orchestrator import ThreatIntelOrchestrator
from app.correlation.campaign_detector import detect_campaigns


class Person4IntelTests(unittest.TestCase):
    def test_mock_provider_demo_ip(self):
        result = asyncio.run(MockIntelProvider().get_ip_intel("203.0.113.42"))
        self.assertEqual(result["country_code"], "SG")
        self.assertTrue(result["is_hosting"])
        self.assertEqual(result["reputation"], "SUSPICIOUS")

    def test_orchestrator_uses_demo_fallback(self):
        orchestrator = ThreatIntelOrchestrator()
        result = asyncio.run(orchestrator.get_ip_intel("203.0.113.42"))
        self.assertEqual(result["geo_source"], "DEMO")
        self.assertEqual(result["ip"], "203.0.113.42")

    def test_campaign_detector_detects_cluster(self):
        records = [
            {"ip": "203.0.113.42", "domain": "secure-login-paypal.com", "risk": 90},
            {"ip": "203.0.113.42", "domain": "account-update-paypal.com", "risk": 82},
            {"ip": "198.51.100.5", "domain": "paypal.com", "risk": 10},
        ]
        campaigns = detect_campaigns(records)
        self.assertGreaterEqual(len(campaigns), 1)
        self.assertEqual(campaigns[0]["cluster_key"], "203.0.113.42")


if __name__ == "__main__":
    unittest.main()
