from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List, Optional
import uuid
from datetime import datetime, timezone

from app.core.database import get_db
from app.models.models import Case, Email, Evidence, User
from app.schemas.schemas import CaseCreate, CaseUpdate, CaseResponse, EmailSummarySchema
from app.api.auth_router import get_current_user

router = APIRouter(prefix="/cases", tags=["cases"])

@router.post("", response_model=CaseResponse)
async def create_case(
    case_in: CaseCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Create a new forensic investigation case."""
    case_num = f"CASE-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
    new_case = Case(
        case_number=case_num,
        title=case_in.title,
        description=case_in.description,
        severity=case_in.severity.upper(),
        status="OPEN",
        created_by=current_user.id if current_user else None,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    db.add(new_case)
    await db.commit()
    await db.refresh(new_case)
    return new_case

@router.get("", response_model=List[CaseResponse])
async def list_cases(
    status: Optional[str] = None,
    severity: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db)
):
    """List forensic cases with optional status/severity filtering."""
    stmt = select(Case).order_by(desc(Case.updated_at)).offset(skip).limit(limit)
    if status:
        stmt = stmt.where(Case.status == status.upper())
    if severity:
        stmt = stmt.where(Case.severity == severity.upper())

    res = await db.execute(stmt)
    cases = res.scalars().all()
    return cases

@router.get("/{case_id}", response_model=CaseResponse)
async def get_case_by_id(case_id: str, db: AsyncSession = Depends(get_db)):
    """Get single investigation case details."""
    res = await db.execute(select(Case).where(Case.id == case_id))
    case = res.scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case

@router.patch("/{case_id}", response_model=CaseResponse)
async def update_case(
    case_id: str,
    case_in: CaseUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update case status, severity, or analyst notes."""
    res = await db.execute(select(Case).where(Case.id == case_id))
    case = res.scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    update_dict = case_in.model_dump(exclude_unset=True)
    for field, val in update_dict.items():
        if val is not None:
            setattr(case, field, val)

    case.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(case)
    return case

@router.post("/{case_id}/emails/{email_id}")
async def link_email_to_case(
    case_id: str,
    email_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Associate an analyzed email with an active forensic case."""
    case_res = await db.execute(select(Case).where(Case.id == case_id))
    case = case_res.scalar_one_or_none()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    email_res = await db.execute(select(Email).where(Email.id == email_id))
    email = email_res.scalar_one_or_none()
    if not email:
        raise HTTPException(status_code=404, detail="Email not found")

    email.case_id = case_id
    case.updated_at = datetime.now(timezone.utc)
    await db.commit()

    return {"status": "SUCCESS", "message": f"Email {email_id} attached to Case {case.case_number}"}

@router.get("/{case_id}/emails", response_model=List[EmailSummarySchema])
async def get_case_emails(case_id: str, db: AsyncSession = Depends(get_db)):
    """List all emails linked to a specific investigation case."""
    stmt = select(Email).where(Email.case_id == case_id).order_by(desc(Email.created_at))
    res = await db.execute(stmt)
    return res.scalars().all()

@router.get("/{case_id}/graph")
async def get_case_global_graph(case_id: str, db: AsyncSession = Depends(get_db)):
    """
    Generate a Campaign-Level Global Threat Graph.
    Merges nodes and edges from all emails in this case to reveal shared infrastructure.
    """
    from app.models.models import AnalysisResult
    stmt = select(AnalysisResult).join(Email).where(Email.case_id == case_id)
    res = await db.execute(stmt)
    results = res.scalars().all()
    
    global_nodes = {}
    global_edges = []
    
    for analysis in results:
        graph_data = analysis.graph_data or {}
        nodes = graph_data.get("nodes", [])
        edges = graph_data.get("edges", [])
        
        for node in nodes:
            global_nodes[node["id"]] = node # deduplicate nodes by ID
            
        global_edges.extend(edges)
        
    # Deduplicate edges based on source/target
    unique_edges = {}
    for edge in global_edges:
        edge_key = f"{edge.get('source')}-{edge.get('target')}"
        unique_edges[edge_key] = edge
        
    return {
        "nodes": list(global_nodes.values()),
        "edges": list(unique_edges.values())
    }
