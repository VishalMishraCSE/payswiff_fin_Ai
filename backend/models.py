from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base
import datetime


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="merchant")  # merchant, admin, analyst, customer_care
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    merchant = relationship("Merchant", back_populates="user", uselist=False)


class Merchant(Base):
    __tablename__ = "merchants"

    id = Column(Integer, primary_key=True, index=True)
    business_name = Column(String(255), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    kyc_status = Column(String(50), default="pending")  # pending, verified, rejected
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    user = relationship("User", back_populates="merchant")
    transactions = relationship("Transaction", back_populates="merchant", cascade="all, delete-orphan")
    support_tickets = relationship("SupportTicket", back_populates="merchant", cascade="all, delete-orphan")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    reference_id = Column(String(100), unique=True, index=True, nullable=False)  # e.g. TXN-90218
    merchant_id = Column(Integer, ForeignKey("merchants.id", ondelete="CASCADE"), nullable=False)
    customer_name = Column(String(255), nullable=False)
    customer_email = Column(String(255), nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="INR")
    status = Column(String(50), default="Pending")  # Success, Pending, Failed
    payment_method = Column(String(50), nullable=False)  # UPI, Card, NetBanking
    is_fraud = Column(Boolean, default=False)
    fraud_score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    merchant = relationship("Merchant", back_populates="transactions")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    method = Column(String(20), nullable=False)  # POST / PATCH / DELETE
    path = Column(String(255), nullable=False)  # /transactions, /merchants/:id
    user_email = Column(String(255), nullable=True)
    status_code = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))


class KYCDocument(Base):
    __tablename__ = "kyc_documents"

    id = Column(Integer, primary_key=True, index=True)
    merchant_id = Column(Integer, ForeignKey("merchants.id", ondelete="CASCADE"), nullable=False)
    document_type = Column(String(50), nullable=False)  # PAN, Aadhaar
    file_path = Column(String(500), nullable=False)
    extracted_text = Column(Text, nullable=True)
    blur_score = Column(Float, nullable=True)
    status = Column(String(50), default="pending")  # pending, verified, rejected
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

    merchant = relationship("Merchant")


class MerchantSettings(Base):
    __tablename__ = "merchant_settings"

    id = Column(Integer, primary_key=True, index=True)
    merchant_id = Column(Integer, ForeignKey("merchants.id", ondelete="CASCADE"), unique=True, nullable=False)
    rate_limit_per_min = Column(Integer, default=100)
    mfa_enabled = Column(Boolean, default=False)
    settlement_buffer = Column(Float, default=0.0)

    merchant = relationship("Merchant")


class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id = Column(Integer, primary_key=True, index=True)
    ticket_id = Column(String(100), unique=True, index=True, nullable=False)  # e.g. TKT-0825-1049
    merchant_id = Column(Integer, ForeignKey("merchants.id", ondelete="CASCADE"), nullable=False)
    category = Column(String(100), nullable=False)  # SIM Card, Sound Box, Battery, POS Hardware, Payments
    problem_details = Column(Text, nullable=False)
    troubleshooting_attempted = Column(Text, nullable=True)
    status = Column(String(50), default="pending")  # pending, in_progress, resolved
    priority = Column(String(50), default="High")  # Low, Medium, High, Critical
    assigned_to = Column(String(255), default="Customer Care Executive (On-Duty)")
    agent_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    resolved_at = Column(DateTime, nullable=True)

    merchant = relationship("Merchant", back_populates="support_tickets")
