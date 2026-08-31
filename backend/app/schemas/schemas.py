from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- Authentication Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None
    role: str = "analyst"

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class LoginRequest(BaseModel):
    username: str
    password: str

# --- Forensic & Analysis Schemas ---
class RiskSignalSchema(BaseModel):
    signal_id: str
    category: str
    severity: str
    weight: int
    title: str
    description: str
    evidence: Optional[str] = None

class HopSchema(BaseModel):
    hop_order: int
    from_host: Optional[str] = None
    by_host: Optional[str] = None
    with_protocol: Optional[str] = None
    for_address: Optional[str] = None
    timestamp: Optional[str] = None
    ip_address: Optional[str] = None
    hop_type: str
    geo_data: Optional[Dict[str, Any]] = None

class AuthResultSchema(BaseModel):
    spf_result: str
    spf_domain: Optional[str] = None
    spf_alignment: Optional[str] = None
    dkim_result: str
    dkim_domain: Optional[str] = None
    dkim_selector: Optional[str] = None
    dkim_alignment: Optional[str] = None
    dmarc_result: str
    dmarc_policy: Optional[str] = None
    details: Optional[Dict[str, Any]] = None

class AttachmentMetaSchema(BaseModel):
    filename: str
    content_type: str
    size_bytes: int
    sha256: str
    suspicious: bool = False
    reasons: List[str] = []

class GraphNode(BaseModel):
    id: str
    type: str
    data: Dict[str, Any]
    position: Dict[str, float] = {"x": 0.0, "y": 0.0}

class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    label: str
    type: str = "smoothstep"

class ThreatGraphSchema(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]

class EmailSummarySchema(BaseModel):
    id: str
    sha256: str
    filename: str
    subject: Optional[str] = None
    from_address: Optional[str] = None
    from_display: Optional[str] = None
    risk_score: Optional[int] = None
    classification: Optional[str] = None
    analysis_status: str
    created_at: datetime

    class Config:
        from_attributes = True

class EmailDetailSchema(BaseModel):
    id: str
    sha256: str
    filename: str
    file_size_bytes: int
    raw_message_id: Optional[str] = None
    subject: Optional[str] = None
    from_address: Optional[str] = None
    from_display: Optional[str] = None
    to_addresses: List[str] = []
    cc_addresses: List[str] = []
    reply_to: Optional[str] = None
    return_path: Optional[str] = None
    date_header: Optional[str] = None
    analysis_status: str
    risk_score: Optional[int] = None
    classification: Optional[str] = None
    created_at: datetime
    
    # Forensic Sub-components
    authentication: Optional[AuthResultSchema] = None
    hops: List[HopSchema] = []
    signals: List[RiskSignalSchema] = []
    attachments: List[AttachmentMetaSchema] = []
    urls: List[Dict[str, Any]] = []
    origin_assessment: Optional[str] = None
    origin_confidence: Optional[int] = None
    graph_data: Optional[ThreatGraphSchema] = None

# --- Case & Evidence Schemas ---
class CaseCreate(BaseModel):
    title: str
    description: Optional[str] = None
    severity: str = "MEDIUM"

class CaseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    assigned_to: Optional[str] = None

class CaseResponse(BaseModel):
    id: str
    case_number: str
    title: str
    description: Optional[str] = None
    severity: str
    status: str
    assigned_to: Optional[str] = None
    created_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    notes: Optional[str] = None
    email_count: int = 0
    evidence_count: int = 0

    class Config:
        from_attributes = True

class ChainOfCustodyEventSchema(BaseModel):
    id: str
    evidence_id: str
    action: str
    actor_name: str
    timestamp: datetime
    ip_address: Optional[str] = None
    note: Optional[str] = None

    class Config:
        from_attributes = True

class EvidenceSchema(BaseModel):
    id: str
    evidence_id: str
    case_id: str
    email_id: Optional[str] = None
    filename: str
    sha256: str
    file_size: int
    evidence_type: str
    integrity_status: str
    uploaded_at: datetime
    chain_events: List[ChainOfCustodyEventSchema] = []

    class Config:
        from_attributes = True

class UploadResponse(BaseModel):
    email_id: str
    sha256: str
    filename: str
    file_size_bytes: int
    status: str
    message: str
    job_id: Optional[str] = None
    risk_score: Optional[int] = None
    classification: Optional[str] = None
