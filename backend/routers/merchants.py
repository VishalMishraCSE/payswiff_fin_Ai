from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from database import get_db
import models

router = APIRouter(prefix="/merchants", tags=["merchants"])


class MerchantOut(BaseModel):
    id: int
    business_name: str
    user_id: int
    created_at: Optional[str] = None

    class Config:
        from_attributes = True


class MerchantUpdate(BaseModel):
    business_name: Optional[str] = None


@router.get("", response_model=list[MerchantOut])
def list_merchants(db: Session = Depends(get_db)):
    return db.query(models.Merchant).all()


@router.get("/{merchant_id}", response_model=MerchantOut)
def get_merchant(merchant_id: int, db: Session = Depends(get_db)):
    merchant = db.query(models.Merchant).filter(models.Merchant.id == merchant_id).first()
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant not found")
    return merchant


@router.patch("/{merchant_id}", response_model=MerchantOut)
def update_merchant(merchant_id: int, updates: MerchantUpdate, db: Session = Depends(get_db)):
    merchant = db.query(models.Merchant).filter(models.Merchant.id == merchant_id).first()
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant not found")
    if updates.business_name:
        merchant.business_name = updates.business_name
    db.commit()
    db.refresh(merchant)
    return merchant
