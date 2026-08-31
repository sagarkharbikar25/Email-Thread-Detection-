# Person 2: Security Lead - Authentication & Header Forensics
## SIH 2026 - 6 Hour Sprint

**Your Role**: Email header forensics, SPF/DKIM/DMARC verification, security architecture  
**Key Dependencies**: P1 (database), P4 (IP enrichment)  
**Success =**: Complete SPF/DKIM/DMARC verification by Hour 3:30

---

## Hour 0:30 - 1:30: JWT Auth Module

### Task 1: JWT Authentication
Create `apps/api/app/core/security.py`:
```python
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthCredentials
from pydantic import BaseModel
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

class TokenData(BaseModel):
    user_id: str
    role: str
    exp: datetime

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_access_token(user_id: str, role: str, expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta is None:
        expires_delta = timedelta(hours=settings.JWT_EXPIRATION_HOURS)
    
    expire = datetime.utcnow() + expires_delta
    to_encode = {"user_id": user_id, "role": role, "exp": expire}
    
    encoded_jwt = jwt.encode(
        to_encode,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM
    )
    return encoded_jwt

async def verify_token(credentials: HTTPAuthCredentials = Depends(security)) -> TokenData:
    token = credentials.credentials
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
        user_id = payload.get("user_id")
        role = payload.get("role")
        
        if user_id is None or role is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        return TokenData(user_id=user_id, role=role, exp=datetime.fromtimestamp(payload.get("exp")))
    
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def require_role(allowed_roles: list):
    async def check_role(token: TokenData = Depends(verify_token)):
        if token.role not in allowed_roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return token
    return check_role
```

### Task 2: Auth Endpoints
Create `apps/api/app/api/auth_router.py`:
```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.models.models import User

router = APIRouter()

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: str
    role: str

@router.post("/auth/login")
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Login with email/password"""
    
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(401, "Invalid credentials")
    
    if not user.is_active:
        raise HTTPException(403, "User account is disabled")
    
    access_token = create_access_token(str(user.id), user.role)
    
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user_id=str(user.id),
        role=user.role
    )

@router.get("/auth/me")
async def get_current_user(
    db: AsyncSession = Depends(get_db),
    token = Depends(verify_token)
):
    """Get current user profile"""
    
    result = await db.execute(select(User).where(User.id == token.user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(404, "User not found")
    
    return {
        "id": str(user.id),
        "email": user.email,
        "username": user.username,
        "role": user.role
    }
```

---

## Hour 1:30 - 2:30: Email Parser & Header Forensics

### Task 1: RFC 5322 Email Parser
Create `apps/api/app/forensics/email_parser.py`:
```python
import email
from email import policy
from email.message import EmailMessage
from typing import Optional, List
from datetime import datetime
import re
from dataclasses import dataclass

@dataclass
class ParsedEmail:
    from_address: str
    from_display: str
    to_addresses: List[str]
    cc_addresses: List[str]
    bcc_addresses: List[str]
    subject: str
    date: Optional[datetime]
    message_id: str
    reply_to: Optional[str]
    return_path: Optional[str]
    body_text: Optional[str]
    body_html: Optional[str]
    received_headers: List[str]
    all_headers: dict
    urls: List[str]
    attachments: List[dict]
    origin_ip: Optional[str] = None

def parse_eml(raw_bytes: bytes) -> ParsedEmail:
    """Parse RFC 5322 email"""
    
    msg = email.message_from_bytes(raw_bytes, policy=policy.default)
    
    # Basic fields
    from_addr = msg.get('From', '')
    subject = msg.get('Subject', '')
    message_id = msg.get('Message-ID', '')
    reply_to = msg.get('Reply-To')
    return_path = msg.get('Return-Path')
    date_str = msg.get('Date')
    
    # Parse From field
    from_display, from_address = parse_email_field(from_addr)
    
    # Recipients
    to_addrs = [a.strip() for a in msg.get_all('To', [])]
    cc_addrs = [a.strip() for a in msg.get_all('Cc', [])]
    bcc_addrs = [a.strip() for a in msg.get_all('Bcc', [])]
    
    # Received headers (in original order, newest first)
    received_headers = msg.get_all('Received', [])
    
    # Body
    body_text = None
    body_html = None
    
    if msg.is_multipart():
        for part in msg.iter_parts():
            content_type = part.get_content_type()
            if content_type == 'text/plain' and body_text is None:
                body_text = part.get_payload(decode=True).decode('utf-8', errors='ignore')
            elif content_type == 'text/html' and body_html is None:
                body_html = part.get_payload(decode=True).decode('utf-8', errors='ignore')
    else:
        body_text = msg.get_payload(decode=True).decode('utf-8', errors='ignore')
    
    # Extract URLs
    urls = extract_urls(body_text or '')
    urls.extend(extract_urls(body_html or ''))
    
    # Attachments
    attachments = extract_attachments(msg)
    
    # Extract origin IP from first external Received hop
    origin_ip = extract_origin_ip(received_headers)
    
    return ParsedEmail(
        from_address=from_address,
        from_display=from_display,
        to_addresses=to_addrs,
        cc_addresses=cc_addrs,
        bcc_addresses=bcc_addrs,
        subject=subject,
        date=parse_date(date_str) if date_str else None,
        message_id=message_id,
        reply_to=reply_to,
        return_path=return_path,
        body_text=body_text,
        body_html=body_html,
        received_headers=received_headers,
        all_headers=dict(msg.items()),
        urls=urls,
        attachments=attachments,
        origin_ip=origin_ip
    )

def parse_email_field(field: str) -> tuple:
    """Extract display name and email address"""
    
    # Handle "Display Name <email@domain.com>"
    match = re.match(r'^([^<]*?)\s*<([^>]+)>\s*$', field)
    if match:
        return match.group(1).strip(), match.group(2).strip()
    
    # Handle just email
    return '', field.strip()

def extract_urls(text: str) -> List[str]:
    """Extract URLs from text"""
    
    url_pattern = r'https?://[^\s<>"{}|\\^`\[\]]+'
    return re.findall(url_pattern, text)

def extract_attachments(msg: EmailMessage) -> List[dict]:
    """Extract attachment metadata"""
    
    attachments = []
    
    if msg.is_multipart():
        for part in msg.iter_parts():
            if part.get_content_disposition() == 'attachment':
                filename = part.get_filename()
                content_type = part.get_content_type()
                size = len(part.get_payload())
                
                attachments.append({
                    'filename': filename,
                    'content_type': content_type,
                    'size': size
                })
    
    return attachments

def extract_origin_ip(received_headers: List[str]) -> Optional[str]:
    """Extract first external IP from Received headers (reversed order)"""
    
    private_ranges = [
        r'^10\.',
        r'^172\.(1[6-9]|2[0-9]|3[01])\.',
        r'^192\.168\.',
        r'^127\.',
        r'^\[?::1\]?$',
    ]
    
    # Reverse to go oldest → newest
    for header in reversed(received_headers):
        # Extract IP in brackets or parentheses
        ip_match = re.search(r'\[?(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\]?', header)
        if ip_match:
            ip = ip_match.group(1)
            
            # Skip private ranges
            if not any(re.match(pattern, ip) for pattern in private_ranges):
                return ip
    
    return None

def parse_date(date_str: str) -> Optional[datetime]:
    """Parse email date header"""
    
    try:
        from email.utils import parsedate_to_datetime
        return parsedate_to_datetime(date_str)
    except:
        return None
```

### Task 2: Header Forensics
Create `apps/api/app/forensics/header_forensics.py`:
```python
from dataclasses import dataclass

@dataclass
class HeaderAnomaly:
    header_name: str
    issue: str
    severity: str  # HIGH, MEDIUM, LOW

def check_header_anomalies(parsed_email) -> list:
    """Detect suspicious header patterns"""
    
    anomalies = []
    
    # 1. From ≠ Reply-To
    from_domain = parsed_email.from_address.split('@')[1] if '@' in parsed_email.from_address else ''
    reply_domain = parsed_email.reply_to.split('@')[1] if parsed_email.reply_to and '@' in parsed_email.reply_to else ''
    
    if from_domain and reply_domain and from_domain != reply_domain:
        anomalies.append(HeaderAnomaly(
            header_name="Reply-To",
            issue=f"Different domain from sender ({reply_domain} vs {from_domain})",
            severity="HIGH"
        ))
    
    # 2. Display name mismatch
    if parsed_email.from_display and parsed_email.from_domain not in parsed_email.from_display.lower():
        if any(title in parsed_email.from_display.lower() for title in ['director', 'ceo', 'cfo', 'chief']):
            anomalies.append(HeaderAnomaly(
                header_name="From",
                issue="Display name contains executive title without domain verification",
                severity="HIGH"
            ))
    
    # 3. Missing Reply-To
    if not parsed_email.reply_to:
        pass  # This is normal, not an anomaly
    
    # 4. Unusual Message-ID
    if parsed_email.message_id and '@' in parsed_email.message_id:
        msg_domain = parsed_email.message_id.split('@')[1].rstrip('>')
        if from_domain and msg_domain != from_domain:
            anomalies.append(HeaderAnomaly(
                header_name="Message-ID",
                issue=f"Message-ID domain ({msg_domain}) differs from From domain ({from_domain})",
                severity="MEDIUM"
            ))
    
    return anomalies
```

---

## Hour 2:30 - 3:30: SPF/DKIM/DMARC Verification

### Task 1: SPF Checker
Create `apps/api/app/forensics/spf_checker.py`:
```python
import spf
import dns.resolver
from typing import Optional

def check_spf(ip: str, sender_domain: str, helo_domain: str) -> dict:
    """Verify SPF record"""
    
    try:
        # Use pyspf to check
        result, explanation = spf.check(
            i=ip,
            s=f"admin@{sender_domain}",
            h=helo_domain or sender_domain
        )
        
        return {
            "spf_result": result.upper(),  # PASS, FAIL, SOFTFAIL, NEUTRAL, NONE, PERMERROR, TEMPERROR
            "spf_domain": sender_domain,
            "spf_ip": ip,
            "explanation": explanation
        }
    except Exception as e:
        return {
            "spf_result": "TEMPERROR",
            "explanation": str(e)
        }

def get_spf_record(domain: str) -> Optional[str]:
    """Retrieve SPF record from DNS"""
    
    try:
        answers = dns.resolver.resolve(domain, 'TXT')
        for rdata in answers:
            for txt_record in rdata.strings:
                record = txt_record.decode('utf-8')
                if record.startswith('v=spf1'):
                    return record
        return None
    except:
        return None
```

### Task 2: DKIM Checker
Create `apps/api/app/forensics/dkim_checker.py`:
```python
import dkim
import dns.resolver
from typing import Optional

def check_dkim(eml_bytes: bytes, sender_domain: str) -> dict:
    """Verify DKIM signature"""
    
    try:
        # dkimpy verifies all DKIM signatures in email
        verified = dkim.verify(eml_bytes)
        
        return {
            "dkim_result": "PASS" if verified else "FAIL",
            "dkim_domain": sender_domain,
            "dkim_selector": "default"
        }
    
    except dkim.DKIMException as e:
        return {
            "dkim_result": "PERMERROR",
            "explanation": "Invalid DKIM signature header"
        }
    except Exception as e:
        return {
            "dkim_result": "TEMPERROR",
            "explanation": str(e)
        }

def get_dkim_public_key(domain: str, selector: str = 'default') -> Optional[str]:
    """Retrieve DKIM public key from DNS"""
    
    try:
        # Query selector._domainkey.domain
        dkim_domain = f"{selector}._domainkey.{domain}"
        answers = dns.resolver.resolve(dkim_domain, 'TXT')
        
        for rdata in answers:
            for txt_record in rdata.strings:
                return txt_record.decode('utf-8')
        return None
    except:
        return None
```

### Task 3: DMARC Checker
Create `apps/api/app/forensics/dmarc_checker.py`:
```python
import dns.resolver
import re
from typing import Optional

def check_dmarc(from_domain: str, spf_result: str, dkim_result: str, dkim_domain: str) -> dict:
    """Verify DMARC policy and alignment"""
    
    # Get DMARC policy
    dmarc_record = get_dmarc_record(from_domain)
    
    if not dmarc_record:
        return {"dmarc_result": "NONE", "explanation": "No DMARC policy found"}
    
    # Parse DMARC record
    dmarc_policy = parse_dmarc_record(dmarc_record)
    
    # Check alignment
    spf_align = "PASS" if spf_result == "PASS" else "FAIL"
    dkim_align = "PASS" if dkim_result == "PASS" and dkim_domain == from_domain else "FAIL"
    
    # DMARC PASS if (SPF pass AND align) OR (DKIM pass AND align)
    dmarc_pass = spf_align == "PASS" or dkim_align == "PASS"
    
    return {
        "dmarc_result": "PASS" if dmarc_pass else "FAIL",
        "dmarc_policy": dmarc_policy.get('p', 'none'),
        "spf_alignment": spf_align,
        "dkim_alignment": dkim_align,
        "explanation": dmarc_record
    }

def get_dmarc_record(domain: str) -> Optional[str]:
    """Retrieve DMARC policy from DNS"""
    
    try:
        answers = dns.resolver.resolve(f"_dmarc.{domain}", 'TXT')
        for rdata in answers:
            for txt_record in rdata.strings:
                record = txt_record.decode('utf-8')
                if record.startswith('v=DMARC1'):
                    return record
        return None
    except:
        return None

def parse_dmarc_record(record: str) -> dict:
    """Parse DMARC record into key-value pairs"""
    
    policy = {}
    
    # Extract tags like p=reject, pct=100, etc.
    for tag in record.split(';'):
        if '=' in tag:
            key, val = tag.split('=', 1)
            policy[key.strip()] = val.strip()
    
    return policy
```

---

## Hour 3:30 - 4:30: Signal Generation for Risk Engine

### Task: Build Risk Signals
Create `apps/api/app/forensics/signal_builder.py`:
```python
from app.forensics.risk_engine import RiskSignal
from typing import List

def build_signals(parsed_email, auth_result: dict, ip_intel: dict, ml_prediction: dict = None) -> List[RiskSignal]:
    """Generate risk signals from all analysis data"""
    
    signals = []
    
    # AUTH SIGNALS
    if auth_result.get('spf_result') == 'FAIL':
        signals.append(RiskSignal(
            signal_id='spf_fail',
            category='AUTH',
            severity='HIGH',
            weight=20,
            title='SPF Failed',
            description='Sending IP not authorized in SPF record',
            evidence=f"SPF result: {auth_result.get('spf_result')}"
        ))
    
    if auth_result.get('dkim_result') == 'FAIL':
        signals.append(RiskSignal(
            signal_id='dkim_fail',
            category='AUTH',
            severity='HIGH',
            weight=20,
            title='DKIM Failed',
            description='DKIM signature verification failed',
            evidence=f"DKIM result: {auth_result.get('dkim_result')}"
        ))
    
    if auth_result.get('dmarc_result') == 'FAIL':
        signals.append(RiskSignal(
            signal_id='dmarc_fail',
            category='AUTH',
            severity='HIGH',
            weight=30,
            title='DMARC Failed',
            description='DMARC policy not satisfied',
            evidence=f"DMARC policy: {auth_result.get('dmarc_policy', 'unknown')}"
        ))
    
    # HEADER SIGNALS
    if parsed_email.reply_to:
        from_domain = parsed_email.from_address.split('@')[1] if '@' in parsed_email.from_address else ''
        reply_domain = parsed_email.reply_to.split('@')[1] if '@' in parsed_email.reply_to else ''
        
        if from_domain != reply_domain:
            signals.append(RiskSignal(
                signal_id='reply_to_mismatch',
                category='HEADER',
                severity='HIGH',
                weight=25,
                title='Reply-To Mismatch',
                description=f'Reply-To domain differs from From domain',
                evidence=f"From: {from_domain}, Reply-To: {reply_domain}"
            ))
    
    # INFRASTRUCTURE SIGNALS
    if ip_intel.get('is_tor'):
        signals.append(RiskSignal(
            signal_id='tor_ip',
            category='INTEL',
            severity='HIGH',
            weight=20,
            title='TOR Exit Node Detected',
            description='Email originated from TOR network exit node',
            evidence=f"IP: {ip_intel.get('ip')}"
        ))
    
    if ip_intel.get('abuse_score', 0) > 50:
        signals.append(RiskSignal(
            signal_id='ip_reputation_high',
            category='INTEL',
            severity='HIGH',
            weight=15,
            title='High Abuse Score',
            description=f'IP reputation indicates malicious activity',
            evidence=f"Abuse Score: {ip_intel.get('abuse_score')}/100"
        ))
    
    # CONTENT SIGNALS
    body = (parsed_email.body_text or '') + (parsed_email.body_html or '')
    
    urgency_keywords = ['immediately', 'urgent', 'asap', 'within 24 hours', 'action required', 'verify now']
    urgency_count = sum(1 for kw in urgency_keywords if kw.lower() in body.lower())
    
    if urgency_count >= 2:
        signals.append(RiskSignal(
            signal_id='urgency_high',
            category='CONTENT',
            severity='MEDIUM',
            weight=10,
            title='High Urgency Language',
            description='Multiple urgency phrases detected',
            evidence=f"Found {urgency_count} urgency keywords"
        ))
    
    financial_keywords = ['wire transfer', 'bank transfer', 'invoice', 'payment', 'account number', 'routing number']
    financial_count = sum(1 for kw in financial_keywords if kw.lower() in body.lower())
    
    if financial_count >= 1:
        signals.append(RiskSignal(
            signal_id='financial_keywords',
            category='CONTENT',
            severity='MEDIUM',
            weight=10,
            title='Financial Trigger Words',
            description='Contains financial request language',
            evidence=f"Found {financial_count} financial keywords"
        ))
    
    return signals
```

---

## Hour 4:30 - 5:30: Handoff

Create `apps/api/app/forensics/__init__.py` (empty file to make folder a package)

Document:
- All header anomalies detected ✅
- All authentication checks working ✅
- Signals for risk engine ready ✅
- Integration with P1's analysis pipeline ✅

---

## Testing Checklist

```python
# Test SPF
from app.forensics.spf_checker import check_spf
result = check_spf("203.0.113.42", "example.com", "example.com")
# Should return {'spf_result': '...', ...}

# Test DKIM
from app.forensics.dkim_checker import check_dkim
with open("demo.eml", "rb") as f:
    result = check_dkim(f.read(), "example.com")
# Should return {'dkim_result': 'PASS' or 'FAIL'}

# Test DMARC
from app.forensics.dmarc_checker import check_dmarc
result = check_dmarc("example.com", "PASS", "PASS", "example.com")
# Should return {'dmarc_result': 'PASS'}
```

---

**Success = All SPF/DKIM/DMARC checks working offline by Hour 3:30**

