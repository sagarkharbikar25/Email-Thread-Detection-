# Person 4: Data & Threat Intelligence - IP/Domain Enrichment
## SIH 2026 - 6 Hour Sprint

**Your Role**: Threat intelligence providers, IP/domain enrichment, campaign detection  
**Key Dependencies**: P1 (database), P6 (Redis cache)  
**Success =**: GeoLite2 bundled + IP intel working offline by Hour 3:30

---

## Hour 1:30 - 2:30: GeoLite2 Setup (Offline Geolocation)

### Task 1: Download & Bundle GeoLite2
```bash
# Register at maxmind.com (free)
# Download GeoLite2-City.mmdb

mkdir -p data/maxmind
# Place GeoLite2-City.mmdb here

# Verify file exists
ls -lh data/maxmind/GeoLite2-City.mmdb
```

### Task 2: MaxMind Provider
Create `apps/api/app/intel/providers/maxmind_provider.py`:
```python
import geoip2.database
import logging
from typing import Optional

logger = logging.getLogger(__name__)

class MaxMindGeoIP2Provider:
    def __init__(self, db_path: str = "data/maxmind/GeoLite2-City.mmdb"):
        self.db_path = db_path
        self.reader = None
        self._load_database()
    
    def _load_database(self):
        """Load GeoLite2 database"""
        try:
            self.reader = geoip2.database.Reader(self.db_path)
            logger.info(f"✅ GeoLite2 database loaded: {self.db_path}")
        except Exception as e:
            logger.error(f"❌ Failed to load GeoLite2: {e}")
            self.reader = None
    
    async def get_ip_intel(self, ip: str) -> dict:
        """Get IP geolocation from bundled database"""
        
        if not self.reader:
            return self._unknown_result(ip)
        
        try:
            response = self.reader.city(ip)
            
            return {
                "ip": ip,
                "country_code": response.country.iso_code,
                "country_name": response.country.name,
                "region": response.subdivisions[0].name if response.subdivisions else None,
                "city": response.city.name,
                "latitude": str(response.location.latitude) if response.location else None,
                "longitude": str(response.location.longitude) if response.location else None,
                "isp": None,  # GeoLite2 doesn't provide ISP
                "asn": None,  # Use AS lookup separately
                "is_vpn": False,  # GeoLite2 free doesn't include
                "is_tor": False,
                "is_proxy": False,
                "is_hosting": False,
                "abuse_score": None,
                "reputation": "UNKNOWN",
                "geo_source": "MAXMIND_LOCAL"
            }
        
        except Exception as e:
            logger.warning(f"Geolocation lookup failed for {ip}: {e}")
            return self._unknown_result(ip)
    
    def _unknown_result(self, ip: str) -> dict:
        return {
            "ip": ip,
            "country_code": None,
            "country_name": None,
            "region": None,
            "city": None,
            "latitude": None,
            "longitude": None,
            "reputation": "UNKNOWN",
            "geo_source": "UNAVAILABLE"
        }
    
    def is_available(self) -> bool:
        return self.reader is not None
```

---

## Hour 2:30 - 3:30: Mock Provider & Orchestrator

### Task 1: Mock Provider (for demo)
Create `apps/api/app/intel/providers/mock_provider.py`:
```python
import logging

logger = logging.getLogger(__name__)

MOCK_IPS = {
    # Demo Singapore VPS
    "203.0.113.42": {
        "country_code": "SG",
        "country_name": "Singapore",
        "city": "Singapore",
        "latitude": "1.3521",
        "longitude": "103.8198",
        "asn": "AS14061",
        "isp": "DigitalOcean",
        "is_hosting": True,
        "reputation": "SUSPICIOUS"
    },
    # Demo Mumbai relay
    "198.51.100.5": {
        "country_code": "IN",
        "country_name": "India",
        "city": "Mumbai",
        "latitude": "19.0760",
        "longitude": "72.8777",
        "asn": "AS9498",
        "isp": "Bharti Airtel",
        "is_hosting": False,
        "reputation": "CLEAN"
    }
}

class MockIntelProvider:
    async def get_ip_intel(self, ip: str) -> dict:
        """Return mock data for demo IPs"""
        
        if ip in MOCK_IPS:
            data = MOCK_IPS[ip]
            return {
                "ip": ip,
                "country_code": data.get("country_code"),
                "country_name": data.get("country_name"),
                "city": data.get("city"),
                "latitude": data.get("latitude"),
                "longitude": data.get("longitude"),
                "asn": data.get("asn"),
                "isp": data.get("isp"),
                "is_hosting": data.get("is_hosting", False),
                "is_vpn": False,
                "is_tor": False,
                "reputation": data.get("reputation", "UNKNOWN"),
                "geo_source": "DEMO"
            }
        
        # Default: minimal data
        return {
            "ip": ip,
            "country_code": None,
            "city": None,
            "geo_source": "DEMO_FALLBACK"
        }
    
    def is_available(self) -> bool:
        return True
```

### Task 2: Provider Orchestrator
Create `apps/api/app/intel/orchestrator.py`:
```python
from typing import Optional
from app.intel.providers.maxmind_provider import MaxMindGeoIP2Provider
from app.intel.providers.mock_provider import MockIntelProvider
import logging

logger = logging.getLogger(__name__)

class ThreatIntelOrchestrator:
    def __init__(self, redis_client=None, db_session=None):
        self.redis = redis_client
        self.db = db_session
        
        # Initialize providers in fallback order
        self.providers = [
            MaxMindGeoIP2Provider(),  # Offline, always first
            MockIntelProvider(),      # Mock for demo
        ]
    
    async def get_ip_intel(self, ip: str) -> dict:
        """Get IP intelligence with fallback"""
        
        # 1. Check Redis cache (1 hour TTL)
        if self.redis:
            cached = await self.redis.get(f"ip_intel:{ip}")
            if cached:
                logger.info(f"📦 IP intel cache hit: {ip}")
                return eval(cached)  # JSON from Redis
        
        # 2. Try providers in order
        for provider in self.providers:
            if not provider.is_available():
                continue
            
            try:
                result = await provider.get_ip_intel(ip)
                
                # Cache result
                if self.redis:
                    await self.redis.setex(
                        f"ip_intel:{ip}",
                        3600,  # 1 hour
                        str(result)
                    )
                
                # Store in DB for long-term retention
                if self.db:
                    await self.db.upsert_ip(ip, result)
                
                return result
            
            except Exception as e:
                logger.warning(f"Provider {provider.__class__.__name__} failed: {e}")
                continue
        
        # 3. Fallback: unknown
        return {"ip": ip, "reputation": "UNKNOWN", "geo_source": "UNAVAILABLE"}
    
    async def get_domain_intel(self, domain: str) -> dict:
        """Get domain intelligence"""
        
        # TODO: WHOIS lookup, DNS records, reputation check
        # For MVP: minimal implementation
        
        return {
            "domain": domain,
            "lookalike_score": 0.0,  # TODO: compute
            "age_days": -1,
            "reputation": "UNKNOWN"
        }
```

---

## Hour 3:30 - 4:30: Campaign Detection & Correlation

### Task: Campaign Detection
Create `apps/api/app/correlation/campaign_detector.py`:
```python
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.models import Campaign, Email, relationships
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

async def detect_and_link_campaign(
    email_id: str,
    origin_ip: str,
    sender_domain: str,
    db: AsyncSession
) -> Optional[str]:
    """
    Detect if email is part of existing campaign.
    Link emails sharing infrastructure over last 30 days.
    """
    
    # Find emails with same origin IP in last 30 days
    cutoff = datetime.utcnow() - timedelta(days=30)
    
    same_ip_result = await db.execute(
        select(Email).where(
            Email.origin_ip == origin_ip,
            Email.received_at > cutoff
        ).limit(10)
    )
    same_ip_emails = same_ip_result.scalars().all()
    
    # Find emails with same sender domain
    same_domain_result = await db.execute(
        select(Email).where(
            Email.from_address.ilike(f"%{sender_domain}"),
            Email.received_at > cutoff
        ).limit(10)
    )
    same_domain_emails = same_domain_result.scalars().all()
    
    shared_count = len(set(same_ip_emails) | set(same_domain_emails))
    
    logger.info(f"📊 Found {shared_count} emails with shared infrastructure")
    
    # If 2+ emails share infrastructure, create/join campaign
    if shared_count >= 2:
        # Check if campaign exists
        existing_campaign = await db.execute(
            select(Campaign).where(
                Campaign.shared_signals.contains(origin_ip) |
                Campaign.shared_signals.contains(sender_domain)
            )
        )
        campaign = existing_campaign.scalar_one_or_none()
        
        if not campaign:
            # Create new campaign
            campaign = Campaign(
                campaign_id=f"CAM-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
                name=f"Campaign from {sender_domain}",
                email_count=shared_count,
                first_seen=datetime.utcnow(),
                last_seen=datetime.utcnow(),
                shared_signals={"ips": [origin_ip], "domains": [sender_domain]}
            )
            db.add(campaign)
            logger.info(f"✨ Created new campaign: {campaign.campaign_id}")
        
        return str(campaign.id)
    
    return None

async def link_email_to_campaign(email_id: str, campaign_id: str, db: AsyncSession):
    """Link email to campaign"""
    
    # Create relationship
    rel = relationships(
        from_type='email',
        from_id=email_id,
        to_type='campaign',
        to_id=campaign_id,
        relationship='PART_OF_CAMPAIGN',
        confidence=85
    )
    db.add(rel)
    await db.commit()
```

---

## Hour 4:30 - 5:30: Demo Data Seeding

### Task: Seed Demo Case
Create `scripts/seed_demo_data.py`:
```python
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.models.models import Base, User, Email, AuthenticationResult, AnalysisResult, Campaign
from app.core.config import settings
from app.core.security import hash_password
import hashlib
from datetime import datetime
import uuid

async def seed_demo():
    """Seed demo data for offline testing"""
    
    engine = create_async_engine(settings.DATABASE_URL)
    
    AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    
    async with AsyncSessionLocal() as db:
        # Create demo users
        analyst = User(
            id=uuid.uuid4(),
            email="demo.analyst@institution.in",
            username="analyst",
            password_hash=hash_password("demo123"),
            role="analyst",
            is_active=True
        )
        
        admin = User(
            id=uuid.uuid4(),
            email="demo.admin@institution.in",
            username="admin",
            password_hash=hash_password("admin123"),
            role="admin",
            is_active=True
        )
        
        db.add_all([analyst, admin])
        await db.commit()
        
        # Create demo campaign
        campaign = Campaign(
            id=uuid.uuid4(),
            campaign_id="CAM-2026-0001",
            name="Operation PayFraud",
            email_count=1,
            first_seen=datetime.utcnow(),
            last_seen=datetime.utcnow(),
            shared_signals={"ips": ["203.0.113.42"], "domains": ["jdcoem-admin.in"]}
        )
        
        db.add(campaign)
        await db.commit()
        
        # Create demo email (pre-analyzed)
        demo_eml_path = "data/demo/bec_demo.eml"
        
        with open(demo_eml_path, "rb") as f:
            content = f.read()
        
        sha256 = hashlib.sha256(content).hexdigest()
        
        email = Email(
            id=uuid.uuid4(),
            sha256=sha256,
            filename="bec_demo.eml",
            file_size_bytes=len(content),
            storage_path=f"emails/{sha256}.eml",
            from_address="director@jdcoem-admin.in",
            from_display="Dr. A.K. Sharma (Director)",
            subject="URGENT: Vendor Payment — Action Required Today",
            to_addresses=["finance@jdcoem.ac.in"],
            reply_to="attacker@gmail.com",
            analysis_status="COMPLETED",
            risk_score=91,
            classification="CRITICAL",
            received_at=datetime.utcnow(),
            uploaded_by=analyst.id
        )
        
        db.add(email)
        await db.commit()
        
        # Create authentication result
        auth = AuthenticationResult(
            id=uuid.uuid4(),
            email_id=email.id,
            spf_result="FAIL",
            spf_domain="jdcoem-admin.in",
            dkim_result="PASS",
            dkim_domain="jdcoem-admin.in",
            dmarc_result="FAIL",
            dmarc_policy="reject",
            spf_alignment="FAIL",
            dkim_alignment="PASS"
        )
        
        db.add(auth)
        await db.commit()
        
        # Create analysis result
        analysis = AnalysisResult(
            id=uuid.uuid4(),
            email_id=email.id,
            risk_score=91,
            classification="CRITICAL",
            confidence=87,
            signals=[
                {
                    "signal_id": "dmarc_fail",
                    "category": "AUTH",
                    "title": "DMARC Failed",
                    "weight": 30
                },
                {
                    "signal_id": "reply_to_mismatch",
                    "category": "HEADER",
                    "title": "Reply-To Mismatch",
                    "weight": 20
                },
                {
                    "signal_id": "urgency_high",
                    "category": "CONTENT",
                    "title": "High Urgency Language",
                    "weight": 15
                }
            ],
            origin_assessment="LIKELY SPOOFED DOMAIN",
            origin_confidence=85
        )
        
        db.add(analysis)
        await db.commit()
        
        print("✅ Demo data seeded successfully")
        print(f"  - Users: analyst (demo123), admin (admin123)")
        print(f"  - Campaign: CAM-2026-0001 (Operation PayFraud)")
        print(f"  - Email: {email.subject}")
        print(f"  - Risk Score: {email.risk_score}/100")

if __name__ == "__main__":
    asyncio.run(seed_demo())
```

---

## Success Checklist

- ✅ GeoLite2 database bundled and loading
- ✅ MaxMind provider returns geolocation
- ✅ Mock provider ready for demo
- ✅ Orchestrator tries providers in order with fallback
- ✅ Campaign detection working
- ✅ Demo data seeded
- ✅ All intelligence enrichment integrated with P1's pipeline

---

**Success = IP intelligence working offline, demo data loaded by Hour 5**

