from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, JSON, ForeignKey, Table
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime, timezone
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

def utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="analyst")  # admin, analyst, investigator, forensic_investigator
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)
    last_login = Column(DateTime, nullable=True)

    # Relationships
    uploaded_emails = relationship("Email", back_populates="uploader", foreign_keys="Email.uploaded_by")
    assigned_cases = relationship("Case", back_populates="assignee", foreign_keys="Case.assigned_to")

class Case(Base):
    __tablename__ = "cases"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    case_number = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    severity = Column(String(20), default="MEDIUM")  # LOW, MEDIUM, HIGH, CRITICAL
    status = Column(String(30), default="OPEN")  # OPEN, INVESTIGATING, CONTAINED, RESOLVED, ARCHIVED
    assigned_to = Column(String(36), ForeignKey("users.id"), nullable=True)
    created_by = Column(String(36), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=utc_now, index=True)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)
    notes = Column(Text, nullable=True)

    # Relationships
    assignee = relationship("User", foreign_keys=[assigned_to], back_populates="assigned_cases")
    emails = relationship("Email", back_populates="case")
    evidence_items = relationship("Evidence", back_populates="case", cascade="all, delete-orphan")

class Email(Base):
    __tablename__ = "emails"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    sha256 = Column(String(64), unique=True, index=True, nullable=False)
    filename = Column(String(255), nullable=False)
    file_size_bytes = Column(Integer, nullable=False)
    storage_path = Column(String(500), nullable=False)
    raw_message_id = Column(String(255), nullable=True)
    subject = Column(String(500), nullable=True)
    from_address = Column(String(255), nullable=True, index=True)
    from_display = Column(String(255), nullable=True)
    to_addresses = Column(JSON, default=list)
    cc_addresses = Column(JSON, default=list)
    reply_to = Column(String(255), nullable=True)
    return_path = Column(String(255), nullable=True)
    date_header = Column(String(100), nullable=True)
    received_at = Column(DateTime, default=utc_now)
    uploaded_by = Column(String(36), ForeignKey("users.id"), nullable=True)
    case_id = Column(String(36), ForeignKey("cases.id"), nullable=True)
    
    # Analysis Status & Quick Overview
    analysis_status = Column(String(30), default="PENDING")  # PENDING, QUEUED, PROCESSING, COMPLETED, FAILED
    risk_score = Column(Integer, nullable=True)
    classification = Column(String(50), nullable=True)  # LEGITIMATE, LOW_RISK, SUSPICIOUS, PHISHING, CRITICAL
    has_attachments = Column(Boolean, default=False)
    attachments_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=utc_now, index=True)

    # Relationships
    uploader = relationship("User", foreign_keys=[uploaded_by], back_populates="uploaded_emails")
    case = relationship("Case", foreign_keys=[case_id], back_populates="emails")
    auth_result = relationship("AuthenticationResult", back_populates="email", uselist=False, cascade="all, delete-orphan")
    analysis_result = relationship("AnalysisResult", back_populates="email", uselist=False, cascade="all, delete-orphan")
    received_hops = relationship("ReceivedHop", back_populates="email", cascade="all, delete-orphan", order_by="ReceivedHop.hop_order")

class AuthenticationResult(Base):
    __tablename__ = "authentication_results"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    email_id = Column(String(36), ForeignKey("emails.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    spf_result = Column(String(30), default="NONE")  # PASS, FAIL, SOFTFAIL, NEUTRAL, NONE, TEMPERROR, PERMERROR
    spf_domain = Column(String(255), nullable=True)
    spf_alignment = Column(String(30), nullable=True)  # PASS, FAIL, UNALIGNED
    
    dkim_result = Column(String(30), default="NONE")  # PASS, FAIL, NONE
    dkim_domain = Column(String(255), nullable=True)
    dkim_selector = Column(String(100), nullable=True)
    dkim_alignment = Column(String(30), nullable=True)
    
    dmarc_result = Column(String(30), default="NONE")  # PASS, FAIL, NONE, QUARANTINE, REJECT
    dmarc_policy = Column(String(50), nullable=True)
    
    details = Column(JSON, default=dict)
    computed_at = Column(DateTime, default=utc_now)

    email = relationship("Email", back_populates="auth_result")

class ReceivedHop(Base):
    __tablename__ = "received_hops"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    email_id = Column(String(36), ForeignKey("emails.id", ondelete="CASCADE"), nullable=False)
    hop_order = Column(Integer, nullable=False)
    from_host = Column(String(255), nullable=True)
    by_host = Column(String(255), nullable=True)
    with_protocol = Column(String(100), nullable=True)
    for_address = Column(String(255), nullable=True)
    timestamp = Column(String(100), nullable=True)
    raw_received = Column(Text, nullable=True)
    ip_address = Column(String(100), nullable=True, index=True)
    hop_type = Column(String(50), default="RELAY")  # ORIGIN, RELAY, DESTINATION, SUSPICIOUS, UNKNOWN
    geo_data = Column(JSON, default=dict)  # Country, city, latitude, longitude, org

    email = relationship("Email", back_populates="received_hops")

class IPAddress(Base):
    __tablename__ = "ip_addresses"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    ip = Column(String(100), unique=True, index=True, nullable=False)
    country_code = Column(String(10), nullable=True)
    country_name = Column(String(100), nullable=True)
    region = Column(String(100), nullable=True)
    city = Column(String(100), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    isp = Column(String(255), nullable=True)
    asn = Column(String(100), nullable=True)
    is_vpn = Column(Boolean, default=False)
    is_tor = Column(Boolean, default=False)
    is_proxy = Column(Boolean, default=False)
    is_hosting = Column(Boolean, default=False)
    abuse_score = Column(Integer, default=0)
    reputation = Column(String(50), default="UNKNOWN")  # CLEAN, SUSPICIOUS, MALICIOUS, UNKNOWN
    geo_source = Column(String(50), default="DEMO")  # LIVE, CACHED, DEMO, MAXMIND_LOCAL
    last_updated = Column(DateTime, default=utc_now)

class AnalysisResult(Base):
    __tablename__ = "analysis_results"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    email_id = Column(String(36), ForeignKey("emails.id", ondelete="CASCADE"), unique=True, nullable=False)
    risk_score = Column(Integer, nullable=False)  # 0 to 100
    classification = Column(String(50), nullable=False)
    confidence = Column(Integer, default=80)
    signals = Column(JSON, default=list)  # [{signal_id, category, severity, weight, title, description, evidence}]
    origin_assessment = Column(String(255), nullable=True)
    origin_confidence = Column(Integer, nullable=True)
    origin_evidence = Column(JSON, default=dict)
    graph_data = Column(JSON, default=dict)  # React Flow format {nodes: [], edges: []}
    attachments_analysis = Column(JSON, default=list)
    urls_analysis = Column(JSON, default=list)
    completed_at = Column(DateTime, default=utc_now)

    email = relationship("Email", back_populates="analysis_result")

class Evidence(Base):
    __tablename__ = "evidence"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    evidence_id = Column(String(50), unique=True, index=True, nullable=False)  # EV-2026-0001
    case_id = Column(String(36), ForeignKey("cases.id"), nullable=False)
    email_id = Column(String(36), ForeignKey("emails.id"), nullable=True)
    filename = Column(String(255), nullable=False)
    sha256 = Column(String(64), index=True, nullable=False)
    file_size = Column(Integer, nullable=False)
    storage_path = Column(String(500), nullable=False)
    evidence_type = Column(String(50), default="EMAIL")  # EMAIL, ATTACHMENT, REPORT, HEADER
    uploaded_by = Column(String(36), ForeignKey("users.id"), nullable=True)
    uploaded_at = Column(DateTime, default=utc_now)
    integrity_status = Column(String(50), default="VERIFIED")  # VERIFIED, TAMPERED, UNKNOWN

    case = relationship("Case", back_populates="evidence_items")
    chain_events = relationship("ChainOfCustodyEvent", back_populates="evidence", cascade="all, delete-orphan")

class ChainOfCustodyEvent(Base):
    __tablename__ = "chain_of_custody_events"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    evidence_id = Column(String(36), ForeignKey("evidence.id", ondelete="CASCADE"), nullable=False)
    action = Column(String(50), nullable=False)  # UPLOADED, VIEWED, ANALYZED, VERIFIED, EXPORTED
    actor_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    actor_name = Column(String(100), default="Analyst")
    timestamp = Column(DateTime, default=utc_now, index=True)
    ip_address = Column(String(100), nullable=True)
    note = Column(Text, nullable=True)

    evidence = relationship("Evidence", back_populates="chain_events")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    actor_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    actor_username = Column(String(100), nullable=True)
    action = Column(String(100), nullable=False)
    resource_type = Column(String(50), nullable=True)
    resource_id = Column(String(36), nullable=True)
    details = Column(JSON, default=dict)
    timestamp = Column(DateTime, default=utc_now, index=True)
