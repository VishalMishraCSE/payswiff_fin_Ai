from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from database import get_db
import models
from auth import get_password_hash, verify_password, create_access_token, create_refresh_token

router = APIRouter(prefix="/auth", tags=["auth"])


class UserRegister(BaseModel):
    email: EmailStr
    password: str
    role: str = "merchant"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    email_lower = user_in.email.lower()
    db_user = db.query(models.User).filter(models.User.email == email_lower).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pwd = get_password_hash(user_in.password)
    new_user = models.User(email=email_lower, hashed_password=hashed_pwd, role=user_in.role)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Automatically create merchant profile if role is merchant
    if user_in.role == "merchant":
        business_name = email_lower.split("@")[0].replace(".", " ").replace("_", " ").title() + " Store"
        merchant = models.Merchant(business_name=business_name, user_id=new_user.id, kyc_status="pending")
        db.add(merchant)
        db.commit()

    return {"message": "User registered successfully", "user_id": new_user.id}


@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    email_lower = credentials.email.lower()
    user = db.query(models.User).filter(models.User.email == email_lower).first()
    if not user or not verify_password(credentials.password, str(user.hashed_password)):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user_data = {"sub": user.email, "role": user.role}
    access_token = create_access_token(user_data)
    refresh_token = create_refresh_token(user_data)
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}
