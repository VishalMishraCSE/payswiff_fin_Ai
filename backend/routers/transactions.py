from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime
from database import get_db
import models

router = APIRouter(prefix="/transactions", tags=["transactions"])


# ── Response Schemas ──────────────────────────────────────────────────────────

class TransactionOut(BaseModel):
    id: int
    reference_id: str
    merchant_id: int
    customer_name: str
    customer_email: str
    amount: float
    currency: str
    status: str
    payment_method: str
    is_fraud: bool
    fraud_score: float
    created_at: datetime

    class Config:
        from_attributes = True


class PaginatedTransactions(BaseModel):
    total: int
    page: int
    page_size: int
    items: List[TransactionOut]


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("", response_model=PaginatedTransactions)
def list_transactions(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None, description="Filter by status: Success, Pending, Failed"),
    merchant_id: Optional[int] = Query(None, description="Filter by merchant ID"),
    payment_method: Optional[str] = Query(None, description="Filter by payment method: UPI, Card, NetBanking"),
    is_fraud: Optional[bool] = Query(None, description="Filter flagged fraud transactions"),
    db: Session = Depends(get_db),
):
    """List all transactions with pagination, filtering by status, merchant, payment method, and fraud flag."""
    query = db.query(models.Transaction)

    if status:
        query = query.filter(models.Transaction.status == status)
    if merchant_id:
        query = query.filter(models.Transaction.merchant_id == merchant_id)
    if payment_method:
        query = query.filter(models.Transaction.payment_method == payment_method)
    if is_fraud is not None:
        query = query.filter(models.Transaction.is_fraud == is_fraud)

    total = query.count()
    items = (
        query.order_by(models.Transaction.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return {"total": total, "page": page, "page_size": page_size, "items": items}


@router.get("/{transaction_id}", response_model=TransactionOut)
def get_transaction(transaction_id: int, db: Session = Depends(get_db)):
    """Get a single transaction by its ID."""
    txn = db.query(models.Transaction).filter(models.Transaction.id == transaction_id).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return txn
