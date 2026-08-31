import email
from email import policy
from email.parser import BytesParser
from email.utils import parseaddr, getaddresses
import re
import hashlib
from typing import List, Dict, Any, Optional
from dataclasses import dataclass, field

@dataclass
class ParsedHop:
    hop_order: int
    from_host: Optional[str] = None
    by_host: Optional[str] = None
    with_protocol: Optional[str] = None
    for_address: Optional[str] = None
    timestamp: Optional[str] = None
    raw_received: str = ""
    ip_address: Optional[str] = None
    hop_type: str = "RELAY"

@dataclass
class ParsedAttachment:
    filename: str
    content_type: str
    size_bytes: int
    sha256: str
    payload: bytes
    suspicious: bool = False
    reasons: List[str] = field(default_factory=list)

@dataclass
class ParsedEmail:
    sha256: str
    raw_message_id: Optional[str] = None
    subject: Optional[str] = None
    from_address: Optional[str] = None
    from_display: Optional[str] = None
    from_domain: Optional[str] = None
    to_addresses: List[str] = field(default_factory=list)
    cc_addresses: List[str] = field(default_factory=list)
    reply_to: Optional[str] = None
    reply_to_domain: Optional[str] = None
    return_path: Optional[str] = None
    return_path_domain: Optional[str] = None
    date_header: Optional[str] = None
    auth_results_header: Optional[str] = None
    received_spf_header: Optional[str] = None
    dkim_signatures: List[str] = field(default_factory=list)
    
    # Body & Links
    body_plain: str = ""
    body_html: str = ""
    urls: List[Dict[str, Any]] = field(default_factory=list)
    
    # Received Hops & Attachments
    hops: List[ParsedHop] = field(default_factory=list)
    origin_ip: Optional[str] = None
    attachments: List[ParsedAttachment] = field(default_factory=list)
    
    # All raw headers
    headers: Dict[str, List[str]] = field(default_factory=dict)

# IPv4 Regex (Standard and Bracketed)
IPV4_REGEX = re.compile(r'\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b')
URL_REGEX = re.compile(r'https?://(?:[-\w.]|(?:%[\da-fA-F]{2}))+[^\s]*', re.IGNORECASE)

DANGEROUS_EXTENSIONS = {
    '.exe', '.scr', '.vbs', '.bat', '.cmd', '.ps1', '.iso', '.img', 
    '.js', '.wsf', '.hta', '.jar', '.docm', '.xlsm', '.pptm'
}

def extract_ip_from_text(text: str) -> Optional[str]:
    """Extract public/valid IP address from header fragment."""
    matches = IPV4_REGEX.findall(text)
    for ip in matches:
        # Ignore obvious private/localhost IPs for origin attribution if public exists
        if ip.startswith("127.") or ip.startswith("0."):
            continue
        return ip
    return matches[0] if matches else None

def parse_received_header(raw_header: str, hop_order: int) -> ParsedHop:
    """Parse single Received header according to RFC 5321."""
    # Clean whitespace
    header_clean = " ".join(raw_header.split())
    
    from_match = re.search(r'from\s+([^\s;]+(?:\s*\([^)]*\))?)', header_clean, re.IGNORECASE)
    by_match = re.search(r'by\s+([^\s;]+)', header_clean, re.IGNORECASE)
    with_match = re.search(r'with\s+([^\s;]+)', header_clean, re.IGNORECASE)
    for_match = re.search(r'for\s+<([^>]+)>', header_clean, re.IGNORECASE)
    date_match = re.search(r';\s*(.+)$', header_clean)
    
    ip = extract_ip_from_text(raw_header)
    
    from_host = from_match.group(1) if from_match else None
    by_host = by_match.group(1) if by_match else None
    with_protocol = with_match.group(1) if with_match else None
    for_address = for_match.group(1) if for_match else None
    timestamp = date_match.group(1).strip() if date_match else None
    
    return ParsedHop(
        hop_order=hop_order,
        from_host=from_host,
        by_host=by_host,
        with_protocol=with_protocol,
        for_address=for_address,
        timestamp=timestamp,
        raw_received=raw_header,
        ip_address=ip,
        hop_type="RELAY"
    )

def parse_eml(content: bytes) -> ParsedEmail:
    """Parse raw .eml bytes into structured forensic representation."""
    sha256_hash = hashlib.sha256(content).hexdigest()
    msg = BytesParser(policy=policy.default).parsebytes(content)
    
    # Extract headers
    headers_dict: Dict[str, List[str]] = {}
    for k, v in msg.items():
        headers_dict.setdefault(k.lower(), []).append(str(v))
        
    subject = str(msg.get("subject", "") or "")
    raw_message_id = str(msg.get("message-id", "") or "")
    date_header = str(msg.get("date", "") or "")
    
    # From details
    from_raw = str(msg.get("from", "") or "")
    from_display, from_address = parseaddr(from_raw)
    from_domain = from_address.split("@")[-1].lower() if "@" in from_address else None
    
    # To & CC details
    to_raw = msg.get_all("to", [])
    to_addresses = [addr for _, addr in getaddresses([str(t) for t in to_raw]) if addr]
    
    cc_raw = msg.get_all("cc", [])
    cc_addresses = [addr for _, addr in getaddresses([str(c) for c in cc_raw]) if addr]
    
    # Reply-To & Return-Path
    reply_to_raw = str(msg.get("reply-to", "") or "")
    _, reply_to = parseaddr(reply_to_raw)
    reply_to_domain = reply_to.split("@")[-1].lower() if "@" in reply_to else None
    
    return_path_raw = str(msg.get("return-path", "") or "")
    _, return_path = parseaddr(return_path_raw)
    return_path_domain = return_path.split("@")[-1].lower() if "@" in return_path else None
    
    # Auth headers
    auth_results_header = str(msg.get("authentication-results", "") or "")
    received_spf_header = str(msg.get("received-spf", "") or "")
    dkim_signatures = [str(s) for s in msg.get_all("dkim-signature", [])]
    
    # Hops (Received: headers are ordered newest to oldest, reverse for chronological hop 1..N)
    received_headers = msg.get_all("received", [])
    hops: List[ParsedHop] = []
    
    # In RFC 5321, bottom-most Received header is typically origin hop
    chrono_received = list(reversed(received_headers))
    for idx, raw_h in enumerate(chrono_received):
        hop = parse_received_header(str(raw_h), hop_order=idx + 1)
        if idx == 0:
            hop.hop_type = "ORIGIN"
        elif idx == len(chrono_received) - 1:
            hop.hop_type = "DESTINATION"
        else:
            hop.hop_type = "RELAY"
        hops.append(hop)
        
    # Pick the earliest public/external IP in transmission hops as the forensic origin IP
    origin_ip = None
    for h in hops:
        if h.ip_address and not h.ip_address.startswith(("127.", "0.", "10.", "192.168.", "172.16.")):
            origin_ip = h.ip_address
            break
    if not origin_ip and hops and hops[0].ip_address:
        origin_ip = hops[0].ip_address
    
    # Extract Body Parts and Attachments
    body_plain = ""
    body_html = ""
    attachments: List[ParsedAttachment] = []
    
    if msg.is_multipart():
        for part in msg.walk():
            content_disposition = str(part.get("Content-Disposition", ""))
            content_type = part.get_content_type()
            filename = part.get_filename()
            
            if filename or "attachment" in content_disposition.lower():
                payload = part.get_payload(decode=True) or b""
                att_sha256 = hashlib.sha256(payload).hexdigest()
                fn = filename or "unnamed_attachment"
                
                # Check suspicious extension
                ext = "." + fn.split(".")[-1].lower() if "." in fn else ""
                suspicious = ext in DANGEROUS_EXTENSIONS
                reasons = [f"Executable or dangerous extension: {ext}"] if suspicious else []
                
                attachments.append(ParsedAttachment(
                    filename=fn,
                    content_type=content_type,
                    size_bytes=len(payload),
                    sha256=att_sha256,
                    payload=payload,
                    suspicious=suspicious,
                    reasons=reasons
                ))
            elif content_type == "text/plain":
                try:
                    body_plain += part.get_payload(decode=True).decode(part.get_content_charset() or "utf-8", errors="replace")
                except Exception:
                    pass
            elif content_type == "text/html":
                try:
                    body_html += part.get_payload(decode=True).decode(part.get_content_charset() or "utf-8", errors="replace")
                except Exception:
                    pass
    else:
        content_type = msg.get_content_type()
        payload = msg.get_payload(decode=True) or b""
        if content_type == "text/html":
            body_html = payload.decode(msg.get_content_charset() or "utf-8", errors="replace")
        else:
            body_plain = payload.decode(msg.get_content_charset() or "utf-8", errors="replace")
            
    # Extract URLs from HTML & Plain Text
    all_text = f"{body_plain} {body_html}"
    found_urls = set(URL_REGEX.findall(all_text))
    urls_list: List[Dict[str, Any]] = []
    
    for u in found_urls:
        # Clean trailing punctuation
        clean_url = u.rstrip(")>],.;'\"")
        domain_match = re.search(r'https?://([^/:\s]+)', clean_url, re.IGNORECASE)
        domain = domain_match.group(1).lower() if domain_match else ""
        is_ip_domain = bool(IPV4_REGEX.match(domain))
        is_suspicious = is_ip_domain or any(keyword in domain for keyword in ["verify", "login", "secure", "update", "account", "banking", "free"])
        
        urls_list.append({
            "url": clean_url,
            "domain": domain,
            "is_ip_domain": is_ip_domain,
            "suspicious": is_suspicious
        })
        
    return ParsedEmail(
        sha256=sha256_hash,
        raw_message_id=raw_message_id,
        subject=subject,
        from_address=from_address,
        from_display=from_display,
        from_domain=from_domain,
        to_addresses=to_addresses,
        cc_addresses=cc_addresses,
        reply_to=reply_to,
        reply_to_domain=reply_to_domain,
        return_path=return_path,
        return_path_domain=return_path_domain,
        date_header=date_header,
        auth_results_header=auth_results_header,
        received_spf_header=received_spf_header,
        dkim_signatures=dkim_signatures,
        body_plain=body_plain,
        body_html=body_html,
        urls=urls_list,
        hops=hops,
        origin_ip=origin_ip,
        attachments=attachments,
        headers=headers_dict
    )
