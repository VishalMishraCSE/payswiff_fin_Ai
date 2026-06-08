# FinAI - Week 1 Detailed Runbook (Zero Risk Execution)

Since we cannot take any risks, this document provides the **exact terminal commands, exact file paths, and exact code** the developers need to write. 

Because a full 40-day code blueprint would be thousands of pages, this runbook covers the critical foundational setup (Days 1 & 2). As we complete these, I will generate the exact code for the subsequent days.

---

## 📅 Day 0: Developer Environment Setup

Before writing any code, **every developer** must execute these exact steps on their local machine.

### 🛠️ Step 1: Install Required Software (Fresh Laptop Setup)
Since you are starting on fresh machines, you must download and install these core dependencies first. **Install them in this exact order:**

1.  **Git** (Version Control)
    *   Download from: [git-scm.com/downloads](https://git-scm.com/downloads)
    *   *Windows users:* Leave all installation options as default.
2.  **Antigravity IDE** (Code Editor)
    *   This is the recommended editor for the entire team. Ensure it is installed and configured on all laptops.
3.  **Node.js** (v18+ LTS - Required for Frontend)
    *   Download from: [nodejs.org](https://nodejs.org/en) (Download the **LTS** version, not Current).
    *   Required for Dev 1, but highly recommended for all devs.
4.  **Python** (3.10+ - Required for Backend & AI)
    *   Download from: [python.org/downloads](https://www.python.org/downloads/)
    *   **CRITICAL WINDOWS STEP:** On the very first installer screen, you **must** check the box that says **"Add python.exe to PATH"** before clicking Install.
5.  **Docker Desktop** (Required for Database & Infra)
    *   Download from: [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/)
    *   You may need to enable WSL2 (Windows Subsystem for Linux) during installation if prompted.

### 📥 Step 2: Clone the Repository
Open your terminal, navigate to where you want the project stored, and run:
```bash
git clone https://github.com/VishalMishraCSE/payswiff_fin_Ai.git
cd payswiff_fin_Ai
```

### 💻 Step 3: Open in Antigravity IDE
Open the repository in Antigravity IDE:
*(Antigravity IDE has built-in support for Next.js, Python, and Docker formatting, so no extra extensions are required).*

### 🌿 Step 4: Checkout the Main Branch
Before running any Day 1 setup commands, ensure you are on the main integration branch:
```bash
git checkout main
```

### 🔄 Step 5: End of Day Sync (Critical)
At the end of *every* day, once you have committed and pushed your work, you must all run:
```bash
git pull origin main
```
This ensures everyone gets the latest backend/frontend/infra code and stays perfectly in sync!

---

## 📅 Day 1: Project Initialization

> [!NOTE]
> **Day 1 has been automatically executed and pushed to GitHub.** The team can skip Day 1 completely and move straight to Day 2.

### 👨‍💻 Developer 1: Frontend Setup
**Goal:** Initialize Next.js and create the base folder structure.

**Step 1: Run the initialization command**
Open your terminal at the root of the repository (`c:\Users\pc\Desktop\FinAI\payswiff_fin_Ai`) and run exactly this:
```bash
npx create-next-app@latest frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```
*(Press Enter for all default prompts if it asks any).*

**Step 2: Install dependencies**
```bash
cd frontend
npm install recharts lucide-react axios zustand
```

**Step 3: Clean up boilerplate**
Open `frontend/src/app/page.tsx`, delete everything, and paste this exact code:
```tsx
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-900 text-white">
      <h1 className="text-4xl font-bold">FinAI Merchant Portal</h1>
      <p className="mt-4 text-slate-400">System initialization complete.</p>
    </main>
  );
}
```

**Step 4: Push to Git**
```bash
git add .
git commit -m "feat(frontend): dev 1 initial nextjs setup"
git push origin main
```

---

### 👨‍💻 Developer 2: Backend Setup
**Goal:** Initialize FastAPI, Virtual Environment, and basic routing.

**Step 1: Create environment**
Open a *new* terminal at the root of the repository:
```powershell
mkdir backend
cd backend
python -m venv venv
.\venv\Scripts\activate
```

**Step 2: Install exact dependencies**
```powershell
pip install fastapi uvicorn sqlalchemy psycopg2-binary pydantic python-jose[cryptography] passlib[bcrypt] redis python-multipart
pip freeze > requirements.txt
```

**Step 3: Create the main server file**
Create a new file exactly at `backend/main.py` and paste this:
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="FinAI Core API", version="1.0.0")

# Allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {"status": "ok", "service": "FinAI Backend Running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
```

**Step 4: Push to Git**
```powershell
git add .
git commit -m "feat(backend): dev 2 initial fastapi setup"
git push origin main
```

---

### 👨‍💻 Developer 3: DevOps & Infra Setup
**Goal:** Create the Docker containers for the database and caching layer.

**Step 1: Create Docker Compose**
Open a *new* terminal at the root of the repository. Create a file named exactly `docker-compose.yml` in the root folder and paste this:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: finai_db
    environment:
      POSTGRES_USER: finai_admin
      POSTGRES_PASSWORD: supersecurepassword123
      POSTGRES_DB: finai_core
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: finai_cache
    ports:
      - "6379:6379"
    restart: unless-stopped

volumes:
  postgres_data:
```

**Step 2: Create GitHub Actions CI**
Run these commands to create the folder structure:
```powershell
mkdir .github
mkdir .github\workflows
```

Create a file at `.github/workflows/ci.yml` and paste:
```yaml
name: FinAI CI Pipeline

on:
  pull_request:
    branches: [ main, develop ]

jobs:
  backend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'
      - name: Install dependencies
        run: |
          cd backend
          python -m pip install --upgrade pip
          pip install -r requirements.txt
          
  frontend-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Build
        run: |
          cd frontend
          npm install
          npm run build
```

**Step 3: Start infrastructure & Push**
```powershell
docker-compose up -d
git add .
git commit -m "feat(infra): dev 3 docker and ci setup"
git push origin main
```

---

## 📅 Day 2: Architecture & Schemas

### 👨‍💻 Developer 1: Multi-Tenant Routing
**Goal:** Set up the Next.js routes so Merchants, Admins, and Analysts have their own URLs.

**Step 1: Create folders**
Inside `frontend/src/app/`, create the following folders:
1. Create folder `(merchant)`
2. Create folder `(admin)`
3. Create folder `(analyst)`

**Step 2: Create Merchant Dashboard**
Create file `frontend/src/app/(merchant)/dashboard/page.tsx`:
```tsx
export default function MerchantDashboard() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Merchant Overview</h1>
      <div className="mt-4 grid grid-cols-3 gap-4">
        <div className="rounded-lg bg-slate-800 p-6 shadow">Total Revenue</div>
        <div className="rounded-lg bg-slate-800 p-6 shadow">Transaction Volume</div>
        <div className="rounded-lg bg-slate-800 p-6 shadow">Fraud Alerts</div>
      </div>
    </div>
  );
}
```

---

### 👨‍💻 Developer 2: Database Schemas
**Goal:** Create the PostgreSQL tables using SQLAlchemy.

**Step 1: Create DB config**
Create file `backend/database.py`:
```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Matches the docker-compose credentials from Dev 3
SQLALCHEMY_DATABASE_URL = "postgresql://finai_admin:supersecurepassword123@localhost:5432/finai_core"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

**Step 2: Create User Model**
Create file `backend/models.py`:
```python
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from database import Base
import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="merchant") # merchant, admin, analyst
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
```

---

### 👨‍💻 Developer 3: Alembic & AWS S3
**Goal:** Initialize database migrations and cloud storage config.

**Step 1: Init Alembic**
Open terminal in `backend/` folder:
```powershell
pip install alembic
alembic init alembic
```

**Step 2: Configure Alembic**
Open `backend/alembic.ini` and change line 63 to exactly:
```ini
sqlalchemy.url = postgresql://finai_admin:supersecurepassword123@localhost:5432/finai_core
```

Open `backend/alembic/env.py` and modify lines 20-22 to:
```python
import os, sys
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from models import Base
target_metadata = Base.metadata
```

**Step 3: Run first migration**
```powershell
alembic revision --autogenerate -m "Initial tables"
alembic upgrade head
```

---

## 📅 Day 3: Core Layout & Authentication Logic

> [!IMPORTANT]
> **CRITICAL FIRST STEP (DO THIS BEFORE WRITING ANY CODE)**
> To ensure your local environment contains the latest database schemas and routing structures created by your teammates, **everyone** must open their terminal and run:
> ```bash
> git pull origin main
> ```


### 👨‍💻 Developer 1: Base UI Layout (Navbar & Sidebar)
**Goal:** Create global navigation components that adapt to user roles.

**Step 1: Create Sidebar Component**
Create a new file `frontend/src/components/Sidebar.tsx` and paste this exact code:
```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Receipt, AlertTriangle, Settings, Users } from "lucide-react";

const menuItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Transactions", href: "/transactions", icon: Receipt },
  { name: "Fraud Alerts", href: "/alerts", icon: AlertTriangle },
  { name: "Team Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 border-r border-slate-800 bg-slate-900 text-slate-300">
      <nav className="flex flex-col gap-2 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-slate-800 hover:text-white ${
                isActive ? "bg-slate-800 text-white" : ""
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
```

**Step 2: Create Navbar Component**
Create a new file `frontend/src/components/Navbar.tsx` and paste this exact code:
```tsx
"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-900 px-6 text-white">
      <Link href="/" className="text-xl font-bold tracking-wider text-teal-400">
        FinAI
      </Link>
      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-400">merchant@finai.com</span>
        <button className="rounded-lg bg-teal-500 px-4 py-2 text-sm font-medium text-slate-950 transition-all hover:bg-teal-400">
          Logout
        </button>
      </div>
    </header>
  );
}
```

**Step 3: Update Global Layout**
Update `frontend/src/app/layout.tsx` to include the Navbar and Sidebar:
```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FinAI - AI Merchant Intelligence",
  description: "Advanced real-time merchant operations and fraud detection",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-950 text-slate-100 min-h-screen`}>
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="ml-64 w-[calc(100vw-16rem)] p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
```

---

### 👨‍💻 Developer 2: Password Hashing & JWT Core
**Goal:** Implement password security and helper functions for session tokens.

**Step 1: Create Auth Helper Library**
Create a new file `backend/auth.py` and paste this exact code:
```python
import datetime
from jose import JWTError, jwt
from passlib.context import CryptContext

# Configuration
SECRET_KEY = "supersecureandsecretkeyforlocaldevchangeinprod"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + datetime.timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None
```

---

### 👨‍💻 Developer 3: Storage & Vector DB Containers
**Goal:** Add MinIO (S3-compatible object storage) and ChromaDB to the Docker environment.

**Step 1: Update `docker-compose.yml`**
Open the root `docker-compose.yml` file and replace its entire contents with this updated definition:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: finai_db
    environment:
      POSTGRES_USER: finai_admin
      POSTGRES_PASSWORD: supersecurepassword123
      POSTGRES_DB: finai_core
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: finai_cache
    ports:
      - "6379:6379"
    restart: unless-stopped

  minio:
    image: minio/minio:RELEASE.2023-09-07T02-42-02Z
    container_name: finai_storage
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadminpassword123
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data
    restart: unless-stopped

  chromadb:
    image: chromadb/chroma:0.4.10
    container_name: finai_vector_db
    ports:
      - "8000:8000"
    volumes:
      - chroma_data:/chroma/data
    restart: unless-stopped

volumes:
  postgres_data:
  minio_data:
  chroma_data:
```

**Step 2: Start new services**
From the repository root, run:
```powershell
docker-compose up -d
```

---

## 📅 Day 4: User Onboarding & Auth APIs

### 👨‍💻 Developer 1: Authentication UI (Login & Sign Up Pages)
**Goal:** Build clean, styled authentication entry forms.

**Step 1: Create Login Page**
Create file `frontend/src/app/login/page.tsx` and paste this exact code:
```tsx
"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login submitted:", { email, password });
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
      <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-8 shadow-lg">
        <h2 className="text-2xl font-bold text-center text-teal-400">Welcome Back</h2>
        <p className="mt-2 text-center text-sm text-slate-400">Login to access your FinAI dashboard</p>
        
        <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
            <input 
              type="email" 
              required
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
            <input 
              type="password" 
              required
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="mt-2 rounded-lg bg-teal-500 py-3 font-semibold text-slate-950 transition-all hover:bg-teal-400">
            Login
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-400">
          Don't have an account? <Link href="/register" className="text-teal-400 hover:underline">Register here</Link>
        </p>
      </div>
    </div>
  );
}
```

**Step 2: Create Register Page**
Create file `frontend/src/app/register/page.tsx` and paste this exact code:
```tsx
"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("merchant");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Registration submitted:", { email, password, role });
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
      <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-8 shadow-lg">
        <h2 className="text-2xl font-bold text-center text-teal-400">Create Account</h2>
        <p className="mt-2 text-center text-sm text-slate-400">Register your merchant or team account</p>
        
        <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
            <input 
              type="email" 
              required
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
            <input 
              type="password" 
              required
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Account Role</label>
            <select
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-teal-400"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="merchant">Merchant</option>
              <option value="analyst">Fraud Analyst</option>
              <option value="admin">System Admin</option>
            </select>
          </div>
          <button className="mt-2 rounded-lg bg-teal-500 py-3 font-semibold text-slate-950 transition-all hover:bg-teal-400">
            Sign Up
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account? <Link href="/login" className="text-teal-400 hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
}
```

---

### 👨‍💻 Developer 2: Auth Endpoints
**Goal:** Create endpoints to register, login, and authenticate users.

**Step 1: Create Auth Router**
Create a new file `backend/routers/auth.py` and paste this exact code:
```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from database import get_db
import models
import auth

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
    db_user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pwd = auth.get_password_hash(user_in.password)
    new_user = models.User(
        email=user_in.email,
        hashed_password=hashed_pwd,
        role=user_in.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User registered successfully", "user_id": new_user.id}

@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == credentials.email).first()
    if not user or not auth.verify_password(credentials.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    user_data = {"sub": user.email, "role": user.role}
    access_token = auth.create_access_token(user_data)
    refresh_token = auth.create_refresh_token(user_data)
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }
```

**Step 2: Register Router in main.py**
Open `backend/main.py` and replace its entire contents with this updated version:
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth

app = FastAPI(title="FinAI Core API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)

@app.get("/")
def health_check():
    return {"status": "ok", "service": "FinAI Backend Running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
```

---

### 👨‍💻 Developer 3: Code Formatting & Pre-Commit Hooks
**Goal:** Setup code standards enforcement so teammate modifications don't break formatting styles.

**Step 1: Create pre-commit config**
Create file `.pre-commit-config.yaml` in the root of the repository:
```yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.4.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: double-quote-string-fixer

  - repo: https://github.com/psf/black
    rev: 23.3.0
    hooks:
      - id: black
        args: [--line-length=120]
```

**Step 2: Install and initialize pre-commit**
Open terminal at the repository root and run:
```powershell
pip install pre-commit
pre-commit install
```
*(Every developer will run `pre-commit install` once to link hooks to their local Git system).*

