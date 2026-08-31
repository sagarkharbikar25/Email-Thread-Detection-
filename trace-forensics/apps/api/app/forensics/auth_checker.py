import re
from typing import Dict, Any, Optional
from app.forensics.email_parser import ParsedEmail

def check_authentication(parsed: ParsedEmail) -> Dict[str, Any]:
    """
    Check SPF, DKIM, and DMARC authentication status and alignment
    from email headers (RFC 7601 / RFC 7489 / RFC 6376 / RFC 7208).
    """
    auth_header = (parsed.auth_results_header or "").lower()
    spf_header = (parsed.received_spf_header or "").lower()
    
    # 1. SPF Evaluation
    spf_result = "NONE"
    spf_domain = parsed.return_path_domain or parsed.from_domain
    
    if "spf=pass" in auth_header or "pass" in spf_header:
        spf_result = "PASS"
    elif "spf=fail" in auth_header or "fail" in spf_header:
        spf_result = "FAIL"
    elif "spf=softfail" in auth_header or "softfail" in spf_header:
        spf_result = "SOFTFAIL"
    elif "spf=neutral" in auth_header or "neutral" in spf_header:
        spf_result = "NEUTRAL"
    elif "spf=none" in auth_header or "none" in spf_header:
        spf_result = "NONE"
        
    # Check SPF Alignment (RFC 7489: Return-Path domain vs From domain)
    spf_alignment = "UNALIGNED"
    if parsed.from_domain and parsed.return_path_domain:
        if parsed.from_domain == parsed.return_path_domain:
            spf_alignment = "STRICT_PASS" if spf_result == "PASS" else "FAIL"
        elif parsed.return_path_domain.endswith("." + parsed.from_domain) or parsed.from_domain.endswith("." + parsed.return_path_domain):
            spf_alignment = "RELAXED_PASS" if spf_result == "PASS" else "FAIL"
        else:
            spf_alignment = "FAIL"
    elif spf_result == "PASS":
        spf_alignment = "PASS"

    # 2. DKIM Evaluation
    dkim_result = "NONE"
    dkim_domain = None
    dkim_selector = None
    
    if parsed.dkim_signatures:
        sig_str = parsed.dkim_signatures[0]
        d_match = re.search(r'\bd=([^;\s]+)', sig_str, re.IGNORECASE)
        s_match = re.search(r'\bs=([^;\s]+)', sig_str, re.IGNORECASE)
        if d_match:
            dkim_domain = d_match.group(1).lower()
        if s_match:
            dkim_selector = s_match.group(1)
            
    if "dkim=pass" in auth_header:
        dkim_result = "PASS"
    elif "dkim=fail" in auth_header:
        dkim_result = "FAIL"
    elif parsed.dkim_signatures:
        dkim_result = "PASS"  # Signature present with no explicit failure logged
        
    # Check DKIM Alignment (d= domain vs From domain)
    dkim_alignment = "UNALIGNED"
    if dkim_domain and parsed.from_domain:
        if dkim_domain == parsed.from_domain:
            dkim_alignment = "STRICT_PASS" if dkim_result == "PASS" else "FAIL"
        elif dkim_domain.endswith("." + parsed.from_domain) or parsed.from_domain.endswith("." + dkim_domain):
            dkim_alignment = "RELAXED_PASS" if dkim_result == "PASS" else "FAIL"
        else:
            dkim_alignment = "FAIL"
    elif dkim_result == "PASS":
        dkim_alignment = "PASS"

    # 3. DMARC Evaluation
    dmarc_result = "NONE"
    dmarc_policy = "none"
    
    if "dmarc=pass" in auth_header:
        dmarc_result = "PASS"
    elif "dmarc=fail" in auth_header:
        dmarc_result = "FAIL"
    else:
        # Synthesize DMARC result: DMARC passes if at least one of (SPF, DKIM) passes and aligns
        if (spf_result == "PASS" and "PASS" in spf_alignment) or (dkim_result == "PASS" and "PASS" in dkim_alignment):
            dmarc_result = "PASS"
        elif spf_result in ["FAIL", "SOFTFAIL"] or dkim_result == "FAIL":
            dmarc_result = "FAIL"
            dmarc_policy = "quarantine"
            
    return {
        "spf_result": spf_result,
        "spf_domain": spf_domain,
        "spf_alignment": spf_alignment,
        "dkim_result": dkim_result,
        "dkim_domain": dkim_domain,
        "dkim_selector": dkim_selector,
        "dkim_alignment": dkim_alignment,
        "dmarc_result": dmarc_result,
        "dmarc_policy": dmarc_policy,
        "details": {
            "auth_header": parsed.auth_results_header,
            "has_dkim_sig": bool(parsed.dkim_signatures),
            "dkim_sig_count": len(parsed.dkim_signatures)
        }
    }
