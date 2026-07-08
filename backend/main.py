from fastapi import FastAPI, Depends, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, transactions, merchants, analytics, copilot, kyc
from auth import RoleChecker, get_current_user
from middleware.audit import AuditLoggingMiddleware
import asyncio
import json
import models
import database
from contextlib import asynccontextmanager

# Ensure all database tables exist on startup
models.Base.metadata.create_all(bind=database.engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    seed_default_users()
    asyncio.create_task(simulate_live_transactions())
    yield


app = FastAPI(title="FinAI Core API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow any frontend connection
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(AuditLoggingMiddleware)

# Include core routers
app.include_router(auth.router)
app.include_router(transactions.router)
app.include_router(merchants.router)
app.include_router(analytics.router)
app.include_router(copilot.router)
app.include_router(kyc.router)


# ── WebSocket Manager for Real-Time Anomaly Alerts ────────────────────────────


class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"WebSocket Client connected. Active: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            print(f"WebSocket Client disconnected. Active: {len(self.active_connections)}")

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                pass


manager = ConnectionManager()


@app.websocket("/ws/alerts")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection open by listening for any ping text
            data = await websocket.receive_text()
            await websocket.send_text(json.dumps({"type": "ping", "message": "acknowledged"}))
    except WebSocketDisconnect:
        manager.disconnect(websocket)


# ── Background Task: Live Transaction Anomaly Simulation ──────────────────────


async def simulate_live_transactions():
    """
    Background worker simulating live transaction requests.
    Periodically injects suspicious events and broadcasts alerts.
    """
    import random
    from database import SessionLocal
    import models

    print("Starting background Live Transaction Simulation...")
    while True:
        await asyncio.sleep(12)  # Emit transaction every 12 seconds

        # Only inject and broadcast if someone is listening to prevent database bloat
        if manager.active_connections:
            db = SessionLocal()
            try:
                # Find a merchant profile to link
                merchant = db.query(models.Merchant).first()
                if merchant:
                    names = [
                        "Priya Sharma",
                        "Vikram Patel",
                        "Sneha Rao",
                        "Rohan Singh",
                        "Amit Kumar",
                        "Anjali Iyer",
                        "Rahul Malhotra",
                        "Pooja Verma",
                    ]
                    customer = random.choice(names)
                    amount = round(random.uniform(50000.0, 95000.0), 2)
                    payment_method = random.choice(["Card", "UPI", "NetBanking"])

                    # Compute mock fraud metrics
                    is_fraud = random.random() < 0.35
                    fraud_score = (
                        round(random.uniform(75.0, 99.5), 1) if is_fraud else round(random.uniform(2.0, 30.0), 1)
                    )
                    status = "Failed" if is_fraud and random.random() < 0.5 else "Success"

                    txn = models.Transaction(
                        reference_id=f"TXN-LIVE-{random.randint(100000, 999999)}",
                        merchant_id=merchant.id,
                        customer_name=customer,
                        customer_email=f"{customer.lower().replace(' ', '_')}@live.com",
                        amount=amount,
                        currency="INR",
                        status=status,
                        payment_method=payment_method,
                        is_fraud=is_fraud,
                        fraud_score=fraud_score,
                    )
                    db.add(txn)
                    db.commit()
                    db.refresh(txn)

                    alert_payload = {
                        "type": "alert" if is_fraud else "transaction",
                        "id": txn.id,
                        "reference_id": txn.reference_id,
                        "customer_name": txn.customer_name,
                        "amount": txn.amount,
                        "payment_method": txn.payment_method,
                        "is_fraud": txn.is_fraud,
                        "fraud_score": txn.fraud_score,
                        "status": txn.status,
                        "created_at": txn.created_at.isoformat(),
                    }

                    await manager.broadcast(json.dumps(alert_payload))
            except Exception as e:
                print(f"WS anomaly generator error: {e}")
            finally:
                db.close()


def seed_default_users():
    from database import SessionLocal
    import models
    from auth import get_password_hash

    db = SessionLocal()
    try:
        defaults = [
            {
                "email": "merchant@payswiff.com",
                "role": "merchant",
                "password": "Password123!",
                "biz": "Payswiff Demo Store",
            },
            {"email": "analyst@payswiff.com", "role": "analyst", "password": "Password123!", "biz": None},
            {"email": "admin@payswiff.com", "role": "admin", "password": "Password123!", "biz": None},
        ]
        for item in defaults:
            user = db.query(models.User).filter(models.User.email == item["email"]).first()
            if not user:
                pwd = str(item["password"]) if item["password"] is not None else "Password123!"
                hashed = get_password_hash(pwd)
                user = models.User(email=item["email"], hashed_password=hashed, role=item["role"])
                db.add(user)
                db.commit()
                db.refresh(user)

                if item["role"] == "merchant":
                    merchant = db.query(models.Merchant).filter(models.Merchant.user_id == user.id).first()
                    if not merchant:
                        merchant = models.Merchant(business_name=item["biz"], user_id=user.id)
                        db.add(merchant)
                        db.commit()
    except Exception as e:
        print(f"Failed to seed default accounts: {e}")
    finally:
        db.close()


@app.get("/")
def health_check():
    return {"status": "ok", "service": "FinAI Backend Running"}


@app.get("/analyst-only-data")
def read_analyst_data(current_user=Depends(RoleChecker(["analyst", "admin"]))):
    return {"message": "Welcome, Analyst. Here is the fraud queue metadata."}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
