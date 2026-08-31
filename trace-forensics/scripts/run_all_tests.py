import sys
import os
import asyncio
from pathlib import Path

# Fix unicode output on Windows
if sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError:
        pass

# Add apps/api to sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
API_DIR = BASE_DIR / "apps" / "api"
if str(API_DIR) not in sys.path:
    sys.path.insert(0, str(API_DIR))

from app.forensics.email_parser import parse_eml
from app.forensics.auth_checker import check_authentication
from app.forensics.risk_engine import build_signals, compute_risk_score, get_origin_assessment
from app.intel.ip_provider import get_ip_intel
from app.ml.nlp_phish_scorer import nlp_scorer
from app.correlation.graph_builder import build_email_graph
from app.correlation.campaign_detector import detect_campaigns

PAYPAL_SAMPLE = b"""Received: from mail-relay-edge.attacker-net.org ([185.220.101.5])
	by mx.victim-corp.com with ESMTP id p12345
	for <victim.user@victim-corp.com>; Mon, 31 Aug 2026 08:30:12 +0000
From: "PayPal Security Center" <service@paypal.com>
To: victim.user@victim-corp.com
Reply-To: harvester-drop@secure-verify-paypal-help.com
Return-Path: <bounce@secure-verify-paypal-help.com>
Subject: URGENT: Your PayPal Account Has Been Suspended - Verify Identity Immediately
Date: Mon, 31 Aug 2026 08:30:00 +0000
Message-ID: <20260831083000.876123@secure-verify-paypal-help.com>
MIME-Version: 1.0
Content-Type: text/plain; charset="utf-8"

Dear Valued Customer,
Your account has been suspended due to suspicious activity. Please verify your identity immediately to restore access:
http://185.220.101.5/paypal-login-secure/verify.php
"""

def test_mime_parser():
    print("[TEST 1] Person 1 & 2: Testing RFC 5322 MIME Parser & Received Hops...", end=" ")
    parsed = parse_eml(PAYPAL_SAMPLE)
    assert parsed.from_address == "service@paypal.com"
    assert parsed.from_display == "PayPal Security Center"
    assert parsed.from_domain == "paypal.com"
    assert parsed.reply_to_domain == "secure-verify-paypal-help.com"
    assert len(parsed.hops) >= 1
    assert parsed.hops[0].ip_address == "185.220.101.5"
    assert len(parsed.urls) >= 1
    print("✅ PASS")
    return parsed

def test_auth_checker(parsed):
    print("[TEST 2] Person 2: Testing SPF / DKIM / DMARC Authentication Engine...", end=" ")
    auth = check_authentication(parsed)
    assert auth is not None
    assert "spf_result" in auth
    assert "dmarc_result" in auth
    print("✅ PASS")
    return auth

def test_ml_nlp_scorer(parsed):
    print("[TEST 3] Person 3: Testing ML NLP Phishing Content Classifier...", end=" ")
    nlp_res = nlp_scorer.analyze_content(parsed.subject, parsed.body_plain)
    assert nlp_res["is_suspicious_content"] is True
    assert nlp_res["ml_phish_probability"] >= 0.60
    assert nlp_res["predicted_intent"] in ["CREDENTIAL_HARVESTING", "SOCIAL_ENGINEERING_URGENCY"]
    print("✅ PASS")
    return nlp_res

async def test_threat_intel():
    print("[TEST 4] Person 4: Testing GeoIP & Tor Exit Node Intel Provider...", end=" ")
    intel = await get_ip_intel("185.220.101.5")
    assert intel.get("is_tor") is True
    assert intel.get("country_code") == "DE"
    
    intel_ru = await get_ip_intel("194.26.29.112")
    assert intel_ru.get("country_code") == "RU"
    assert intel_ru.get("abuse_score", 0) > 50
    print("✅ PASS")
    return intel

def test_campaign_detector():
    print("[TEST 5] Person 4: Testing Cross-Email Campaign Detection...", end=" ")
    records = [
        {"ip": "185.220.101.5", "domain": "secure-verify-paypal-help.com", "risk": 100},
        {"ip": "185.220.101.5", "domain": "login-paypal-verify.net", "risk": 95},
        {"ip": "194.26.29.112", "domain": "executive-wire.org", "risk": 90},
    ]
    campaigns = detect_campaigns(records)
    assert len(campaigns) >= 1
    assert campaigns[0]["cluster_key"] == "185.220.101.5"
    assert campaigns[0]["email_count"] == 2
    print("✅ PASS")

def test_risk_and_graph(parsed, auth, intel):
    print("[TEST 6] Person 1 & 5: Testing Risk Engine & Threat Graph Construction...", end=" ")
    signals = build_signals(parsed, auth, intel)
    score, classification, conf = compute_risk_score(signals)
    assert score >= 80
    assert classification == "CRITICAL"
    
    email_data = {
        "email_id": "test-id",
        "subject": parsed.subject,
        "from_address": parsed.from_address,
        "from_domain": parsed.from_domain,
        "risk_score": score,
        "classification": classification,
        "hops": [h.__dict__ for h in parsed.hops],
        "urls": parsed.urls,
        "attachments": [],
        "origin_ip": intel.get("ip"),
        "is_tor": intel.get("is_tor"),
        "abuse_score": intel.get("abuse_score"),
        "country_name": intel.get("country_name"),
        "asn": intel.get("asn")
    }
    graph = build_email_graph(email_data)
    assert len(graph["nodes"]) >= 3
    assert len(graph["edges"]) >= 2
    print("✅ PASS")

async def run_all():
    print("\n" + "=" * 80)
    print(" 🚀 TRACE FORENSICS — COMPREHENSIVE TEST RUNNER (PERSONS 1 TO 6)")
    print("=" * 80)
    
    parsed = test_mime_parser()
    auth = test_auth_checker(parsed)
    nlp = test_ml_nlp_scorer(parsed)
    intel = await test_threat_intel()
    test_campaign_detector()
    test_risk_and_graph(parsed, auth, intel)
    
    print("=" * 80)
    print(" ✨ ALL 6 CORE TEST SUITES PASSED WITH 100% SUCCESS!")
    print("=" * 80 + "\n")

if __name__ == "__main__":
    asyncio.run(run_all())
