from dataclasses import dataclass
from typing import List, Dict, Any, Optional, Tuple
from app.forensics.email_parser import ParsedEmail
from app.ml.nlp_phish_scorer import nlp_scorer

@dataclass
class RiskSignal:
    signal_id: str
    category: str  # AUTH, HEADER, DOMAIN, INTEL, CONTENT, ATTACHMENT, ML_NLP
    severity: str  # CRITICAL, HIGH, MEDIUM, LOW, INFO
    weight: int
    title: str
    description: str
    evidence: Optional[str] = None

def build_signals(
    parsed: ParsedEmail,
    auth_result: Dict[str, Any],
    ip_intel: Dict[str, Any]
) -> List[RiskSignal]:
    """Generate granular forensic risk signals from parsed attributes."""
    signals: List[RiskSignal] = []
    
    # 0. ML NLP Content & Urgency Evaluation (Person 3 Deliverable)
    nlp_res = nlp_scorer.analyze_content(parsed.subject or "", parsed.body_plain or "")
    if nlp_res.get("is_suspicious_content"):
        prob = nlp_res.get("ml_phish_probability", 0)
        intent = nlp_res.get("predicted_intent", "SUSPICIOUS")
        feat = nlp_res.get("detected_features", {})
        
        weight = int(prob * 35)
        severity = "CRITICAL" if prob >= 0.75 else "HIGH" if prob >= 0.50 else "MEDIUM"
        
        triggers = []
        if feat.get("urgency_triggers"):
            triggers.extend(feat["urgency_triggers"])
        if feat.get("credential_prompts"):
            triggers.extend(feat["credential_prompts"])
        if feat.get("financial_keywords"):
            triggers.extend(feat["financial_keywords"])
            
        signals.append(RiskSignal(
            signal_id="ml_nlp_phish_intent",
            category="CONTENT",
            severity=severity,
            weight=weight,
            title=f"NLP Threat Classifier: {intent.replace('_', ' ').title()}",
            description=f"ML content analysis detected strong social engineering keywords with {int(prob * 100)}% confidence.",
            evidence=f"Keywords: {', '.join(triggers[:4]) if triggers else 'Social engineering markers'}"
        ))
    
    # 1. Authentication Signals
    spf_res = auth_result.get("spf_result", "NONE").upper()
    if spf_res in ["FAIL", "SOFTFAIL"]:
        signals.append(RiskSignal(
            signal_id="auth_spf_fail",
            category="AUTH",
            severity="HIGH",
            weight=25,
            title="SPF Authentication Failed",
            description=f"Sender IP is not authorized in SPF record for {auth_result.get('spf_domain')}.",
            evidence=f"SPF Result: {spf_res}"
        ))
    elif spf_res == "PASS":
        signals.append(RiskSignal(
            signal_id="auth_spf_pass",
            category="AUTH",
            severity="INFO",
            weight=-10,
            title="SPF Verified",
            description=f"SPF verified for sending domain {auth_result.get('spf_domain')}.",
            evidence="SPF: PASS"
        ))

    dkim_res = auth_result.get("dkim_result", "NONE").upper()
    if dkim_res == "FAIL":
        signals.append(RiskSignal(
            signal_id="auth_dkim_fail",
            category="AUTH",
            severity="HIGH",
            weight=20,
            title="DKIM Signature Verification Failed",
            description="Cryptographic signature in DKIM-Signature header is invalid or tampered.",
            evidence=f"DKIM Result: FAIL (d={auth_result.get('dkim_domain')})"
        ))
    elif dkim_res == "PASS":
        signals.append(RiskSignal(
            signal_id="auth_dkim_pass",
            category="AUTH",
            severity="INFO",
            weight=-10,
            title="DKIM Signature Verified",
            description=f"Cryptographic signature verified for domain {auth_result.get('dkim_domain')}.",
            evidence=f"DKIM: PASS (selector={auth_result.get('dkim_selector')})"
        ))

    dmarc_res = auth_result.get("dmarc_result", "NONE").upper()
    if dmarc_res == "FAIL":
        signals.append(RiskSignal(
            signal_id="auth_dmarc_fail",
            category="AUTH",
            severity="CRITICAL",
            weight=30,
            title="DMARC Policy Rejection / Alignment Failure",
            description="Email failed domain owner's DMARC policy. Highly indicative of address spoofing.",
            evidence=f"DMARC: FAIL (Policy: {auth_result.get('dmarc_policy')})"
        ))

    # 2. Header & Alignment Discrepancies
    if parsed.from_domain and parsed.reply_to_domain:
        if parsed.from_domain != parsed.reply_to_domain:
            signals.append(RiskSignal(
                signal_id="header_replyto_mismatch",
                category="HEADER",
                severity="HIGH",
                weight=20,
                title="From vs Reply-To Domain Mismatch",
                description=f"Replies will be routed to {parsed.reply_to_domain} instead of claimed sender {parsed.from_domain}.",
                evidence=f"From: {parsed.from_address} | Reply-To: {parsed.reply_to}"
            ))

    # Display name spoofing (e.g. 'PayPal Security' <attacker@random.com> or 'IT Support' <user@gmail.com>)
    if parsed.from_display and parsed.from_domain:
        display_lower = parsed.from_display.lower()
        free_mail_providers = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "protonmail.com", "aol.com", "icloud.com"]
        
        # High-risk financial / tech targets
        targeted_brands = ["paypal", "microsoft", "google", "apple", "amazon", "netflix", "chase", "wellsfargo", "bankofamerica", "coinbase", "binance", "dhl", "fedex"]
        matched_brand = next((b for b in targeted_brands if b in display_lower and b not in parsed.from_domain), None)
        
        # Department impersonation on free mail providers (e.g. 'IT Support' from @gmail.com)
        dept_keywords = ["support", "security center", "helpdesk", "billing department", "account team", "ceo", "chief executive"]
        matched_dept = next((d for d in dept_keywords if d in display_lower and parsed.from_domain in free_mail_providers), None)
        
        if matched_brand:
            signals.append(RiskSignal(
                signal_id="domain_display_name_spoof",
                category="DOMAIN",
                severity="CRITICAL",
                weight=35,
                title="Executive / Brand Display Name Spoofing",
                description=f"Sender display name mimics '{matched_brand.title()}' but sending domain is '{parsed.from_domain}'.",
                evidence=f"Display: '{parsed.from_display}' <{parsed.from_address}>"
            ))
        elif matched_dept:
            signals.append(RiskSignal(
                signal_id="domain_display_name_spoof",
                category="DOMAIN",
                severity="HIGH",
                weight=25,
                title="Department Impersonation via Public Webmail",
                description=f"Corporate department '{matched_dept.title()}' claimed from public mail provider '{parsed.from_domain}'.",
                evidence=f"Display: '{parsed.from_display}' <{parsed.from_address}>"
            ))

    # 3. Threat Intelligence / IP Signals
    if ip_intel.get("is_tor"):
        signals.append(RiskSignal(
            signal_id="intel_tor_exit_node",
            category="INTEL",
            severity="CRITICAL",
            weight=40,
            title="Origin IP is Tor Exit Node",
            description="Email originated from an anonymized Tor relay, commonly utilized in targeted cyber attacks.",
            evidence=f"IP: {ip_intel.get('ip')} | ISP: {ip_intel.get('isp')}"
        ))
    if ip_intel.get("is_vpn") or ip_intel.get("is_proxy"):
        signals.append(RiskSignal(
            signal_id="intel_proxy_vpn_node",
            category="INTEL",
            severity="MEDIUM",
            weight=15,
            title="Origin IP is Known Proxy / VPN",
            description="Email sent through commercial VPN or web proxy infrastructure.",
            evidence=f"IP: {ip_intel.get('ip')} ({ip_intel.get('country_name')})"
        ))
    if ip_intel.get("abuse_score", 0) > 50:
        signals.append(RiskSignal(
            signal_id="intel_ip_high_abuse",
            category="INTEL",
            severity="HIGH",
            weight=25,
            title="High Threat Intelligence Abuse Score",
            description=f"Origin IP has a high abuse/reputation score ({ip_intel.get('abuse_score')}/100).",
            evidence=f"Abuse score: {ip_intel.get('abuse_score')}%"
        ))

    # 4. Attachments Signals
    for att in parsed.attachments:
        if att.suspicious:
            signals.append(RiskSignal(
                signal_id="att_dangerous_extension",
                category="ATTACHMENT",
                severity="CRITICAL",
                weight=35,
                title="Suspicious or Executable Attachment",
                description=f"Email contains dangerous file '{att.filename}' ({att.content_type}).",
                evidence=f"File: {att.filename} (SHA-256: {att.sha256[:16]}...)"
            ))

    # 5. URL & Link Signals
    suspicious_urls = [u for u in parsed.urls if u.get("suspicious")]
    if suspicious_urls:
        signals.append(RiskSignal(
            signal_id="content_suspicious_urls",
            category="CONTENT",
            severity="HIGH",
            weight=min(30, len(suspicious_urls) * 15),
            title=f"Embedded Phishing / Suspicious Links ({len(suspicious_urls)} detected)",
            description="Body contains links with suspicious keywords, mismatched hostnames, or raw IP addresses.",
            evidence=f"Sample: {suspicious_urls[0]['url'][:60]}"
        ))

    return signals

def compute_risk_score(signals: List[RiskSignal]) -> Tuple[int, str, int]:
    """
    Compute aggregate risk score (0-100), classification, and confidence.
    """
    base_score = 0
    for s in signals:
        base_score += s.weight

    score = max(0, min(100, base_score))
    
    if score < 20:
        classification = "LEGITIMATE"
    elif score < 40:
        classification = "LOW_RISK"
    elif score < 65:
        classification = "SUSPICIOUS"
    elif score < 85:
        classification = "PHISHING"
    else:
        classification = "CRITICAL"
        
    confidence = 85 if len(signals) >= 3 else 70
    return score, classification, confidence

def get_origin_assessment(
    signals: List[RiskSignal],
    auth_result: Dict[str, Any],
    ip_intel: Dict[str, Any],
    parsed: ParsedEmail
) -> Dict[str, Any]:
    """Generate detailed forensic origin assessment report."""
    has_auth_fail = any(s.signal_id in ["auth_spf_fail", "auth_dmarc_fail", "auth_dkim_fail"] for s in signals)
    has_brand_spoof = any(s.signal_id == "domain_display_name_spoof" for s in signals)
    is_anonymized = ip_intel.get("is_tor") or ip_intel.get("is_vpn")
    
    if has_brand_spoof or (has_auth_fail and is_anonymized):
        assessment = "CONFIRMED SPOOFED IDENTITY - High-confidence credential harvesting infrastructure"
        confidence = 95
    elif has_auth_fail:
        assessment = "PROBABLE DOMAIN SPOOFING - Sender authentication failed domain policy"
        confidence = 80
    elif ip_intel.get("is_hosting"):
        assessment = "CLOUD / HOSTING INFRASTRUCTURE - Origin attribution obscured by hosting provider"
        confidence = 65
    elif auth_result.get("spf_result") == "PASS" and auth_result.get("dkim_result") == "PASS":
        assessment = f"AUTHENTICATED ORIGIN - Traced to authorized {parsed.from_domain or 'origin'} infrastructure"
        confidence = 90
    else:
        assessment = "STANDARD RELAY - No immediate spoofing anomalies detected in transmission path"
        confidence = 60
        
    return {
        "assessment": assessment,
        "confidence": confidence,
        "evidence": {
            "origin_ip": ip_intel.get("ip"),
            "geo": f"{ip_intel.get('city')}, {ip_intel.get('country_name')}",
            "isp": ip_intel.get("isp"),
            "asn": ip_intel.get("asn"),
            "spf": auth_result.get("spf_result"),
            "dkim": auth_result.get("dkim_result"),
            "dmarc": auth_result.get("dmarc_result")
        }
    }
