from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from typing import List, Optional
import uuid
import hashlib
import os
from datetime import datetime, timezone

from app.core.database import get_db
from app.models.models import Evidence, ChainOfCustodyEvent, Case, User
from app.schemas.schemas import EvidenceSchema, ChainOfCustodyEventSchema
from app.api.auth_router import get_current_user

router = APIRouter(prefix="/evidence", tags=["evidence"])

@router.get("", response_model=List[EvidenceSchema])
async def list_evidence(
    case_id: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db)
):
    """List forensic evidence items with optional case filtering."""
    stmt = (
        select(Evidence)
        .options(selectinload(Evidence.chain_events))
        .order_by(desc(Evidence.uploaded_at))
        .offset(skip)
        .limit(limit)
    )
    if case_id:
        stmt = stmt.where(Evidence.case_id == case_id)
    res = await db.execute(stmt)
    evidence_items = res.scalars().all()
    return evidence_items

@router.get("/{evidence_id}", response_model=EvidenceSchema)
async def get_evidence_item(evidence_id: str, db: AsyncSession = Depends(get_db)):
    """Retrieve single digital evidence item and its complete chain of custody history."""
    stmt = (
        select(Evidence)
        .options(selectinload(Evidence.chain_events))
        .where((Evidence.id == evidence_id) | (Evidence.evidence_id == evidence_id))
    )
    res = await db.execute(stmt)
    item = res.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Evidence item not found")
    return item

@router.post("/{evidence_id}/verify")
async def verify_evidence_integrity(
    evidence_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Forensic Integrity Verification:
    Recomputes SHA-256 hash from physical storage file and verifies against tamper-evident database hash.
    Records a chain of custody VERIFIED event.
    """
    res = await db.execute(select(Evidence).where((Evidence.id == evidence_id) | (Evidence.evidence_id == evidence_id)))
    item = res.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Evidence item not found")

    if not os.path.exists(item.storage_path):
        item.integrity_status = "FILE_MISSING"
        await db.commit()
        raise HTTPException(status_code=404, detail="Physical evidence file missing from storage path")

    with open(item.storage_path, "rb") as f:
        recalculated_hash = hashlib.sha256(f.read()).hexdigest()

    is_valid = recalculated_hash.lower() == item.sha256.lower()
    item.integrity_status = "VERIFIED" if is_valid else "TAMPERED"

    # Log chain of custody event
    event = ChainOfCustodyEvent(
        evidence_id=item.id,
        action="VERIFIED",
        actor_id=current_user.id if current_user else None,
        actor_name=current_user.full_name or current_user.username if current_user else "Forensic Analyst",
        timestamp=datetime.now(timezone.utc),
        note=f"SHA-256 Integrity Verification: {'PASSED' if is_valid else 'FAILED (TAMPER DETECTED)'}"
    )
    db.add(event)
    await db.commit()

    return {
        "evidence_id": item.evidence_id,
        "recorded_sha256": item.sha256,
        "calculated_sha256": recalculated_hash,
        "integrity_status": item.integrity_status,
        "verified_at": datetime.now(timezone.utc).isoformat()
    }
