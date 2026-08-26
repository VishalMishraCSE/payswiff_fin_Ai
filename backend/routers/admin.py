from fastapi import APIRouter, Depends, HTTPException, Body, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from database import get_db
import models
import datetime
from typing import Dict, Any, List, Optional
import os

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/overview")
def get_admin_overview(db: Session = Depends(get_db)):
    """Retrieve comprehensive platform metrics for the Admin Dashboard."""
    total_users = db.query(models.User).count()
    total_merchants = db.query(models.Merchant).count()
    total_txns = db.query(models.Transaction).count()
    
    total_revenue = (
        db.query(func.sum(models.Transaction.amount))
        .filter(models.Transaction.status == "Success")
        .scalar() or 0.0
    )
    
    fraud_count = db.query(models.Transaction).filter(models.Transaction.is_fraud == True).count()
    audit_logs_count = db.query(models.AuditLog).count()
    tickets_count = db.query(models.SupportTicket).count()
    pending_kyc = db.query(models.Merchant).filter(models.Merchant.kyc_status == "pending").count()
    verified_kyc = db.query(models.Merchant).filter(models.Merchant.kyc_status == "verified").count()
    
    # User roles breakdown
    roles = (
        db.query(models.User.role, func.count(models.User.id))
        .group_by(models.User.role)
        .all()
    )
    role_map = {r[0]: r[1] for r in roles}

    # NVIDIA AI key check
    nv_key = os.getenv("NVIDIA_API_KEY", "")
    ai_status = "Connected (Llama-3.1 70B & 8B)" if nv_key else "Local Rule Engine"

    return {
        "total_users": total_users,
        "total_merchants": total_merchants,
        "total_transactions": total_txns,
        "total_revenue": round(total_revenue, 2),
        "active_fraud_alerts": fraud_count,
        "total_audit_logs": audit_logs_count,
        "total_support_tickets": tickets_count,
        "pending_kyc_count": pending_kyc,
        "verified_kyc_count": verified_kyc,
        "roles_breakdown": {
            "merchant": role_map.get("merchant", 0),
            "customer_care": role_map.get("customer_care", 0),
            "analyst": role_map.get("analyst", 0),
            "admin": role_map.get("admin", 0),
        },
        "system_health": {
            "database": "MySQL 8.0 Live (finai_db)",
            "ai_engine": ai_status,
            "api_uptime": "99.98%",
            "system_status": "All Systems Operational",
        }
    }


@router.get("/users")
def list_admin_users(db: Session = Depends(get_db)):
    """List all platform users with profile information."""
    users = db.query(models.User).order_by(models.User.created_at.desc()).all()
    results = []
    for u in users:
        merchant_name = u.merchant.business_name if u.merchant else "—"
        results.append({
            "id": u.id,
            "email": u.email,
            "role": u.role,
            "is_active": u.is_active,
            "business_name": merchant_name,
            "created_at": u.created_at.isoformat() if u.created_at else None,
        })
    return results


@router.patch("/users/{user_id}")
def update_user_status(user_id: int, payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    """Allows Admin to update user role or toggle active state."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if "role" in payload:
        user.role = payload["role"]
    if "is_active" in payload:
        user.is_active = bool(payload["is_active"])
        
    db.commit()
    db.refresh(user)
    return {"status": "success", "message": f"User {user.email} updated successfully."}


@router.get("/merchants")
def list_admin_merchants(db: Session = Depends(get_db)):
    """List all merchants with KYC status and transaction count."""
    merchants = db.query(models.Merchant).order_by(models.Merchant.created_at.desc()).all()
    results = []
    for m in merchants:
        user = db.query(models.User).filter(models.User.id == m.user_id).first()
        txn_count = db.query(models.Transaction).filter(models.Transaction.merchant_id == m.id).count()
        results.append({
            "id": m.id,
            "business_name": m.business_name,
            "user_email": user.email if user else "—",
            "kyc_status": m.kyc_status,
            "total_transactions": txn_count,
            "created_at": m.created_at.isoformat() if m.created_at else None,
        })
    return results


@router.patch("/merchants/{merchant_id}/kyc")
def update_merchant_kyc(merchant_id: int, payload: Dict[str, Any] = Body(...), db: Session = Depends(get_db)):
    """Update merchant KYC status."""
    merchant = db.query(models.Merchant).filter(models.Merchant.id == merchant_id).first()
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant not found")
    
    status = payload.get("kyc_status")
    if status not in ["verified", "pending", "rejected"]:
        raise HTTPException(status_code=400, detail="Invalid KYC status")
        
    merchant.kyc_status = status
    db.commit()
    db.refresh(merchant)
    return {"status": "success", "message": f"Merchant {merchant.business_name} KYC set to {status}."}


@router.get("/audit-logs")
def list_admin_audit_logs(limit: int = Query(50, le=200), db: Session = Depends(get_db)):
    """Retrieve security audit logs."""
    logs = db.query(models.AuditLog).order_by(models.AuditLog.created_at.desc()).limit(limit).all()
    return [
        {
            "id": l.id,
            "method": l.method,
            "path": l.path,
            "user_email": l.user_email or "system@payswiff.com",
            "status_code": l.status_code,
            "created_at": l.created_at.isoformat() if l.created_at else None,
        }
        for l in logs
    ]
