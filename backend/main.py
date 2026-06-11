from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, transactions, merchants
from auth import RoleChecker, get_current_user
from middleware.audit import AuditLoggingMiddleware

app = FastAPI(title="FinAI Core API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(AuditLoggingMiddleware)

app.include_router(auth.router)
app.include_router(transactions.router)
app.include_router(merchants.router)


@app.get("/")
def health_check():
    return {"status": "ok", "service": "FinAI Backend Running"}


@app.get("/analyst-only-data")
def read_analyst_data(current_user=Depends(RoleChecker(["analyst", "admin"]))):
    return {"message": "Welcome, Analyst. Here is the fraud queue metadata."}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
