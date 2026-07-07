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


class MockPayInput(BaseModel):
    customer_name: str
    customer_email: str
    amount: float
    payment_method: str  # Card, UPI, NetBanking
    merchant_id: Optional[int] = 1


# ── Endpoints ─────────────────────────────────────────────────────────────────


@router.post("/mock-pay", response_model=TransactionOut)
async def create_mock_transaction(payload: MockPayInput, db: Session = Depends(get_db)):
    """Simulates processing a mock payment transaction, running ML scoring, and saving to SQLite."""
    import random
    from ml_models import score_transaction_ml

    # 1. Run local ML Fraud Scoring
    ml_res = score_transaction_ml(
        amount=payload.amount, payment_method=payload.payment_method, hour=datetime.now().hour
    )

    fraud_prob = ml_res["fraud_score"]
    is_fraud = ml_res["is_fraud"]

    # 2. Determine Transaction Status: Fail 5% randomly, or if fraud probability is extremely high
    if fraud_prob > 75.0:
        status = "Failed" if random.random() < 0.8 else "Success"
    else:
        status = "Failed" if random.random() < 0.05 else "Success"

    ref_id = f"TXN-MOCK-{random.randint(100000, 999999)}"

    txn = models.Transaction(
        reference_id=ref_id,
        merchant_id=payload.merchant_id,
        customer_name=payload.customer_name,
        customer_email=payload.customer_email,
        amount=payload.amount,
        currency="INR",
        status=status,
        payment_method=payload.payment_method,
        is_fraud=is_fraud,
        fraud_score=fraud_prob / 100.0,  # Store database value in 0.0 - 1.0 format
    )

    db.add(txn)
    db.commit()
    db.refresh(txn)

    # 3. Broadcast real-time alert via Websocket manager
    try:
        from main import manager
        import json

        alert_payload = {
            "type": "alert" if txn.is_fraud else "transaction",
            "id": txn.id,
            "reference_id": txn.reference_id,
            "customer_name": txn.customer_name,
            "amount": txn.amount,
            "payment_method": txn.payment_method,
            "is_fraud": txn.is_fraud,
            "fraud_score": txn.fraud_score * 100.0,
            "status": txn.status,
            "created_at": txn.created_at.isoformat(),
        }

        await manager.broadcast(json.dumps(alert_payload))
    except Exception as e:
        print(f"Failed to broadcast mock transaction: {e}")

    return txn


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
    items = query.order_by(models.Transaction.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

    return {"total": total, "page": page, "page_size": page_size, "items": items}


@router.get("/{transaction_id}", response_model=TransactionOut)
def get_transaction(transaction_id: int, db: Session = Depends(get_db)):
    """Get a single transaction by its ID."""
    txn = db.query(models.Transaction).filter(models.Transaction.id == transaction_id).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return txn
