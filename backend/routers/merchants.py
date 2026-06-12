from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from database import get_db
import models

router = APIRouter(prefix="/merchants", tags=["merchants"])


# ── Response Schemas ──────────────────────────────────────────────────────────


class MerchantOut(BaseModel):
    id: int
    business_name: str
    kyc_status: str
    user_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class MerchantUpdate(BaseModel):
    business_name: Optional[str] = None
    kyc_status: Optional[str] = None


class MerchantCreate(BaseModel):
    business_name: str
    user_id: int
    kyc_status: str = "pending"


class PaginatedMerchants(BaseModel):
    total: int
    page: int
    page_size: int
    items: List[MerchantOut]


class MerchantSettingsOut(BaseModel):
    merchant_id: int
    business_name: str
    kyc_status: str
    user_email: Optional[str] = None
    account_created: Optional[datetime] = None

    class Config:
        from_attributes = True


# ── Endpoints ─────────────────────────────────────────────────────────────────


@router.get("", response_model=PaginatedMerchants)
def list_merchants(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    kyc_status: Optional[str] = Query(None, description="Filter by KYC status: pending, verified, rejected"),
    search: Optional[str] = Query(None, description="Search by business name"),
    db: Session = Depends(get_db),
):
    """List all merchants with pagination and optional filtering."""
    query = db.query(models.Merchant)

    if kyc_status:
        query = query.filter(models.Merchant.kyc_status == kyc_status)
    if search:
        query = query.filter(models.Merchant.business_name.ilike(f"%{search}%"))

    total = query.count()
    items = (
        query.order_by(models.Merchant.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return {"total": total, "page": page, "page_size": page_size, "items": items}


@router.post("", response_model=MerchantOut, status_code=201)
def create_merchant(merchant_in: MerchantCreate, db: Session = Depends(get_db)):
    """Create a new merchant profile linked to an existing user."""
    # Verify the user exists
    user = db.query(models.User).filter(models.User.id == merchant_in.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check if user already has a merchant profile
    existing = db.query(models.Merchant).filter(models.Merchant.user_id == merchant_in.user_id).first()
    if existing:
        raise HTTPException(status_code=409, detail="User already has a merchant profile")

    new_merchant = models.Merchant(
        business_name=merchant_in.business_name,
        user_id=merchant_in.user_id,
        kyc_status=merchant_in.kyc_status,
    )
    db.add(new_merchant)
    db.commit()
    db.refresh(new_merchant)
    return new_merchant


@router.get("/{merchant_id}", response_model=MerchantOut)
def get_merchant(merchant_id: int, db: Session = Depends(get_db)):
    """Get a single merchant by their ID."""
    merchant = db.query(models.Merchant).filter(models.Merchant.id == merchant_id).first()
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant not found")
    return merchant


@router.patch("/{merchant_id}", response_model=MerchantOut)
def update_merchant(merchant_id: int, updates: MerchantUpdate, db: Session = Depends(get_db)):
    """Update a merchant's profile fields (business name and/or KYC status)."""
    merchant = db.query(models.Merchant).filter(models.Merchant.id == merchant_id).first()
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant not found")
    if updates.business_name is not None:
        merchant.business_name = updates.business_name
    if updates.kyc_status is not None:
        merchant.kyc_status = updates.kyc_status
    db.commit()
    db.refresh(merchant)
    return merchant


@router.delete("/{merchant_id}", status_code=204)
def delete_merchant(merchant_id: int, db: Session = Depends(get_db)):
    """Delete a merchant profile by ID. Cascades to related transactions."""
    merchant = db.query(models.Merchant).filter(models.Merchant.id == merchant_id).first()
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant not found")
    db.delete(merchant)
    db.commit()
    return None


@router.get("/{merchant_id}/settings", response_model=MerchantSettingsOut)
def get_merchant_settings(merchant_id: int, db: Session = Depends(get_db)):
    """Get a merchant's settings/profile overview including linked user email."""
    merchant = db.query(models.Merchant).filter(models.Merchant.id == merchant_id).first()
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant not found")

    user = db.query(models.User).filter(models.User.id == merchant.user_id).first()

    return {
        "merchant_id": merchant.id,
        "business_name": merchant.business_name,
        "kyc_status": merchant.kyc_status,
        "user_email": user.email if user else None,
        "account_created": merchant.created_at,
    }
