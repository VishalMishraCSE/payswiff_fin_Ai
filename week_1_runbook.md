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
git clone https://github.com/VishalMishraCSE/FinAi.git
cd FinAi
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
Open your terminal at the root of the repository (`c:\Users\pc\Desktop\FinAI\FinAi`) and run exactly this:
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
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
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
    expire = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
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

---

## 📅 Day 5: Secure Integration & Access Controls

### 👨‍💻 Developer 1: Secure Next.js Auth Integration (HttpOnly Cookies)
**Goal:** Prevent XSS/CSRF tokens vulnerabilities by proxying auth requests through a Next.js API route that sets HttpOnly cookies.

**Step 1: Create Next.js API Route for Login**
Create a new file at `frontend/src/app/api/auth/login/route.ts` and paste this code:
```typescript
import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Call FastAPI backend login endpoint
    const response = await axios.post("http://localhost:8000/auth/login", {
      email,
      password,
    });

    const { access_token, refresh_token } = response.data;

    // Create NextResponse and set HttpOnly cookies
    const nextResponse = NextResponse.json({ success: true });

    nextResponse.cookies.set({
      name: "access_token",
      value: access_token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 30, // 30 mins
      path: "/",
    });

    nextResponse.cookies.set({
      name: "refresh_token",
      value: refresh_token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return nextResponse;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.response?.data?.detail || "Authentication failed" },
      { status: error.response?.status || 500 }
    );
  }
}
```

**Step 2: Update the Login Page to use the Route Handler**
Open `frontend/src/app/login/page.tsx` and replace the `handleSubmit` code (lines 10-13) with this:
```tsx
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      // Redirect to dashboard on success
      window.location.href = "/merchant/dashboard";
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
```
*(Add `{error && <p className="text-red-500 text-sm text-center">{error}</p>}` inside the form below the description to display errors).*

---

### 👨‍💻 Developer 2: Role-Based Access Control (RBAC) Middleware
**Goal:** Restrict FastAPI backend routes to specific roles (e.g., Merchant vs Analyst vs Admin).

**Step 1: Create Dependency Guard in `backend/auth.py`**
Append the following helpers to the end of `backend/auth.py`:
```python
from fastapi import Depends, HTTPException, status, Security
from fastapi.security import OAuth2PasswordBearer
from database import get_db
from sqlalchemy.orm import Session
import models

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> models.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_token(token)
    if payload is None:
        raise credentials_exception
    email: str = payload.get("sub")
    if email is None:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
    return user

class RoleChecker:
    def __init__(self, allowed_roles: list[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, user: models.User = Depends(get_current_user)) -> models.User:
        if user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Operation not permitted for this user role"
            )
        return user
```

**Step 2: Test Route Protection**
Open `backend/main.py` and modify the health check or add a protected test endpoint:
```python
from fastapi import Depends
from auth import RoleChecker, get_current_user

@app.get("/analyst-only-data")
def read_analyst_data(current_user = Depends(RoleChecker(["analyst", "admin"]))):
    return {"message": "Welcome, Analyst. Here is the fraud queue metadata."}
```

---

### 👨‍💻 Developer 3: Pull Request Template & GitHub Workflow
**Goal:** Create a structured layout for developer code reviews.

**Step 1: Create PR Template**
Create a new file at `.github/pull_request_template.md` and paste:
```markdown
## 📌 Description
Explain the changes made in this Pull Request.

## 🛠️ Tech Stack & Scope
- [ ] Frontend (Dev 1)
- [ ] Backend (Dev 2)
- [ ] AI/Infra (Dev 3)

## 🧪 Verification Done
Detail the manual tests or scripts run to verify these changes.

## 🚨 Security Checklist
- [ ] No hardcoded passwords/secrets.
- [ ] Input data sanitized.
```

---

## 📅 Day 6: Database Models & Synthetic Data

### 👨‍💻 Developer 1: Next.js Layout Routing Guards
**Goal:** Restrict page rendering on the client side using cookies.

**Step 1: Create Next.js Middleware**
Create file `frontend/src/middleware.ts` to redirect non-authenticated requests:
```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const path = request.nextUrl.pathname;

  if (path.startsWith("/merchant") || path.startsWith("/admin") || path.startsWith("/analyst")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/merchant/:path*", "/admin/:path*", "/analyst/:path*"],
};
```

---

### 👨‍💻 Developer 2: Transaction & Merchant Models
**Goal:** Add tables to PostgreSQL to represent merchants and payments.

**Step 1: Append Models**
Open `backend/models.py` and append:
```python
from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship

class Merchant(Base):
    __tablename__ = "merchants"

    id = Column(Integer, primary_key=True, index=True)
    business_name = Column(String, unique=True, nullable=False)
    kyc_status = Column(String, default="pending")  # pending, verified, failed
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    merchant_id = Column(Integer, ForeignKey("merchants.id"), nullable=False)
    amount = Column(Integer, nullable=False) # stored in cents/paise
    status = Column(String, default="pending") # success, pending, failed
    fraud_score = Column(Integer, default=0) # 0-100 score
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
```

**Step 2: Generate alembic migration**
In the `backend` terminal, run:
```powershell
alembic revision --autogenerate -m "Add merchant and transaction tables"
alembic upgrade head
```

---

### 👨‍💻 Developer 3: Synthetic Data Generator Script
**Goal:** Populate the database with realistic merchant and transaction records (with synthetic fraud indicators) so the team has mock datasets.

**Step 1: Create script**
Create file `backend/scripts/generate_data.py`:
```python
import sys
import os
import random
import datetime

# Add root folder to sys.path to allow imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal, engine
import models

def run():
    db = SessionLocal()
    try:
        # 1. Create a synthetic merchant
        merchant = models.Merchant(
            business_name="Acme Wholesale",
            kyc_status="verified"
        )
        db.add(merchant)
        db.commit()
        db.refresh(merchant)

        print(f"Created Merchant: {merchant.business_name} (ID: {merchant.id})")

        # 2. Generate 100 mock transactions
        statuses = ["success", "success", "success", "failed", "pending"]
        for _ in range(100):
            amount = random.randint(100, 100000) # cents
            status = random.choice(statuses)
            # Create higher fraud score for large midnight transactions
            fraud_score = random.randint(70, 99) if amount > 80000 else random.randint(0, 30)

            txn = models.Transaction(
                merchant_id=merchant.id,
                amount=amount,
                status=status,
                fraud_score=fraud_score,
                created_at=datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=random.randint(0, 30))
            )
            db.add(txn)

        db.commit()
        print("Generated 100 synthetic transaction records successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    run()
```

Run the script locally to populate database:
```powershell
python scripts/generate_data.py
```

---

## 📅 Day 7: Design System & Transaction APIs

> [!IMPORTANT]
> **CRITICAL FIRST STEP — Pull before you code!**
> ```bash
> git pull origin main
> ```

### 👨‍💻 Developer 1: Tailwind Design System (Dark Mode + Brand Tokens)
**Goal:** Define FinAI's brand colors, fonts, and dark mode globally so every page looks consistent.

**Step 1: Update `frontend/tailwind.config.ts`**
Open the file and replace its entire contents with:
```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#080B11",
          surface: "#0B0F19",
          border: "#1E293B",
          primary: "#6366F1",   // Indigo
          accent: "#10B981",    // Emerald
          danger: "#EF4444",    // Rose
          warning: "#F59E0B",   // Amber
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.5s ease-in-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

**Step 2: Update `frontend/src/app/globals.css`**
Replace the entire file contents:
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-brand-bg text-slate-100 font-sans antialiased;
  }
  * {
    @apply border-brand-border;
  }
}

@layer components {
  .card {
    @apply bg-brand-surface/60 backdrop-blur-md border border-brand-border rounded-2xl p-6;
  }
  .btn-primary {
    @apply bg-brand-primary hover:bg-indigo-500 text-white font-semibold px-4 py-2.5 rounded-xl transition-all active:scale-95 shadow-md shadow-indigo-600/20;
  }
  .btn-secondary {
    @apply bg-brand-surface border border-brand-border hover:bg-slate-800 text-slate-300 font-medium px-4 py-2.5 rounded-xl transition-all;
  }
  .stat-card {
    @apply card hover:-translate-y-1 duration-300 overflow-hidden relative group;
  }
  .badge-success {
    @apply bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-xs font-bold;
  }
  .badge-pending {
    @apply bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full text-xs font-bold;
  }
  .badge-failed {
    @apply bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-0.5 rounded-full text-xs font-bold;
  }
}
```

**Step 3: Commit your work**
```powershell
git add .
git commit -m "feat(frontend): add FinAI design system with brand tokens and CSS components"
git push origin main
```

---

### 👨‍💻 Developer 2: Transaction CRUD APIs (with Pagination)
**Goal:** Build all backend endpoints for transactions — list, detail, filter, paginate.

**Step 1: Create Transaction Router**
Create file `backend/routers/transactions.py`:
```python
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from pydantic import BaseModel
from database import get_db
import models

router = APIRouter(prefix="/transactions", tags=["transactions"])

class TransactionOut(BaseModel):
    id: int
    merchant_id: int
    amount: int
    status: str
    fraud_score: int

    class Config:
        from_attributes = True

class PaginatedTransactions(BaseModel):
    total: int
    page: int
    page_size: int
    items: List[TransactionOut]

@router.get("", response_model=PaginatedTransactions)
def list_transactions(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    merchant_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(models.Transaction)
    if status:
        query = query.filter(models.Transaction.status == status)
    if merchant_id:
        query = query.filter(models.Transaction.merchant_id == merchant_id)

    total = query.count()
    items = query.order_by(models.Transaction.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

    return {"total": total, "page": page, "page_size": page_size, "items": items}

@router.get("/{transaction_id}", response_model=TransactionOut)
def get_transaction(transaction_id: int, db: Session = Depends(get_db)):
    txn = db.query(models.Transaction).filter(models.Transaction.id == transaction_id).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return txn
```

**Step 2: Register Router in `backend/main.py`**
```python
from routers import transactions
app.include_router(transactions.router)
```

**Step 3: Commit**
```powershell
git add .
git commit -m "feat(backend): add paginated transaction CRUD APIs"
git push origin main
```

---

### 👨‍💻 Developer 3: Scale Synthetic Data to 100k Records
**Goal:** Give the team a large enough dataset to test dashboards, charts, and ML models.

**Step 1: Update `backend/scripts/generate_data.py`**
Replace the file's entire contents with the high-volume version:
```python
import sys, os, random, datetime
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal
import models

MERCHANT_NAMES = [
    "Acme Wholesale", "BrightMart", "Cloud Bazaar",
    "DealKing Pvt Ltd", "EasyRetail", "FreshCart",
]
STATUSES = ["success"] * 7 + ["pending"] * 2 + ["failed"] * 1  # 70% success, 20% pending, 10% failed
METHODS = ["UPI", "NetBanking", "Card", "Wallet"]

def run():
    db = SessionLocal()
    try:
        merchants = []
        for name in MERCHANT_NAMES:
            existing = db.query(models.Merchant).filter(models.Merchant.business_name == name).first()
            if not existing:
                m = models.Merchant(business_name=name, kyc_status="verified")
                db.add(m)
                db.commit()
                db.refresh(m)
                merchants.append(m)
            else:
                merchants.append(existing)

        print(f"Loaded {len(merchants)} merchant(s). Generating 100,000 transactions...")

        BATCH_SIZE = 500
        total_records = 100_000
        batch = []

        for i in range(total_records):
            merchant = random.choice(merchants)
            amount = random.randint(50, 200000)
            status = random.choice(STATUSES)

            # Higher fraud score for large-amount failed transactions
            if status == "failed" and amount > 50000:
                fraud_score = random.randint(70, 99)
            else:
                fraud_score = random.randint(0, 25)

            # Spread transactions across past 90 days
            days_back = random.randint(0, 90)
            hours_back = random.randint(0, 23)
            created_at = (datetime.datetime.now(datetime.timezone.utc)
                          - datetime.timedelta(days=days_back, hours=hours_back))

            txn = models.Transaction(
                merchant_id=merchant.id,
                amount=amount,
                status=status,
                fraud_score=fraud_score,
                created_at=created_at
            )
            batch.append(txn)

            if len(batch) >= BATCH_SIZE:
                db.bulk_save_objects(batch)
                db.commit()
                batch = []
                print(f"  Committed {i + 1}/{total_records} records...")

        if batch:
            db.bulk_save_objects(batch)
            db.commit()

        print("Done! 100,000 synthetic transaction records successfully generated.")
    finally:
        db.close()

if __name__ == "__main__":
    run()
```

**Step 2: Run it (ensure PostgreSQL Docker container is running)**
```powershell
python scripts/generate_data.py
```

**Step 3: Commit**
```powershell
git add .
git commit -m "feat(infra): scale synthetic data generator to 100k records with fraud patterns"
git push origin main
```

---

## 📅 Day 8: Transaction History Table & Merchant Profile API

> [!IMPORTANT]
> **Pull latest before starting!**
> ```bash
> git pull origin main
> ```

### 👨‍💻 Developer 1: Transaction History Data Table UI
**Goal:** Build a live, sortable, data-rich transaction history table component.

**Step 1: Create `TransactionTable` Component**
Create file `frontend/src/components/TransactionTable.tsx`:
```tsx
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";

interface Transaction {
  id: number;
  merchant_id: number;
  amount: number;
  status: string;
  fraud_score: number;
}

export default function TransactionTable() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const pageSize = 20;

  useEffect(() => {
    const params: Record<string, string | number> = { page, page_size: pageSize };
    if (statusFilter) params.status = statusFilter;

    axios.get("http://localhost:8000/transactions", { params })
      .then((res) => {
        setTransactions(res.data.items);
        setTotal(res.data.total);
      })
      .catch(console.error);
  }, [page, statusFilter]);

  const totalPages = Math.ceil(total / pageSize);

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      success: "badge-success",
      pending: "badge-pending",
      failed: "badge-failed",
    };
    return <span className={map[status] || "badge-pending"}>{status}</span>;
  };

  const fraudBadge = (score: number) => {
    if (score >= 70) return <span className="text-xs font-bold text-rose-400">⚠ {score}</span>;
    if (score >= 40) return <span className="text-xs font-bold text-amber-400">{score}</span>;
    return <span className="text-xs text-slate-400">{score}</span>;
  };

  return (
    <div className="card space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">Transaction History</h3>
          <p className="text-xs text-slate-400">{total.toLocaleString()} total records</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-brand-surface border border-brand-border text-sm text-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-primary"
          >
            <option value="">All Statuses</option>
            <option value="success">Success</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-brand-border text-[10px] text-slate-400 uppercase tracking-widest">
              <th className="pb-3 pl-2">ID</th>
              <th className="pb-3">Merchant</th>
              <th className="pb-3">Amount (₹)</th>
              <th className="pb-3">Status</th>
              <th className="pb-3 text-right pr-2">Fraud Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border/50">
            {transactions.map((txn) => (
              <tr key={txn.id} className="hover:bg-slate-900/40 transition-all group">
                <td className="py-3 pl-2 font-mono text-xs text-indigo-400">#{txn.id}</td>
                <td className="py-3 text-xs text-slate-300">MID-{txn.merchant_id}</td>
                <td className="py-3 text-xs font-bold text-slate-100">
                  ₹{(txn.amount / 100).toLocaleString("en-IN")}
                </td>
                <td className="py-3">{statusBadge(txn.status)}</td>
                <td className="py-3 pr-2 text-right">{fraudBadge(txn.fraud_score)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>Page {page} of {totalPages}</span>
        <div className="flex items-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="btn-secondary px-3 py-1.5 disabled:opacity-30"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="btn-secondary px-3 py-1.5 disabled:opacity-30"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Step 2: Use the Component in the Merchant Dashboard**
Open `frontend/src/app/merchant/dashboard/page.tsx` and import + add the component below the charts section:
```tsx
import TransactionTable from "@/components/TransactionTable";

// ... inside the return JSX after the charts section, add:
<TransactionTable />
```

**Step 3: Commit**
```powershell
git add .
git commit -m "feat(frontend): add paginated transaction history table with fraud score indicators"
git push origin main
```

---

### 👨‍💻 Developer 2: Merchant Profile CRUD APIs
**Goal:** Build read and update endpoints for Merchant profile data.

**Step 1: Create Merchant Router**
Create file `backend/routers/merchants.py`:
```python
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
    kyc_status: str

    class Config:
        from_attributes = True

class MerchantUpdate(BaseModel):
    business_name: Optional[str] = None
    kyc_status: Optional[str] = None

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
    if updates.kyc_status:
        merchant.kyc_status = updates.kyc_status
    db.commit()
    db.refresh(merchant)
    return merchant
```

**Step 2: Register in `backend/main.py`**
```python
from routers import merchants
app.include_router(merchants.router)
```

**Step 3: Commit**
```powershell
git add .
git commit -m "feat(backend): add merchant CRUD and profile update API endpoints"
git push origin main
```

---

### 👨‍💻 Developer 3: Audit Logging Middleware Setup
**Goal:** Automatically log every write operation (POST, PATCH, DELETE) to a database table.

**Step 1: Add Audit Log Model to `backend/models.py`**
Append this class:
```python
class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    method = Column(String, nullable=False)      # POST / PATCH / DELETE
    path = Column(String, nullable=False)         # /transactions, /merchants/:id
    user_email = Column(String, nullable=True)
    status_code = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
```

**Step 2: Create Audit Middleware**
Create file `backend/middleware/audit.py`:
```python
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from database import SessionLocal
import models

WRITE_METHODS = {"POST", "PATCH", "PUT", "DELETE"}

class AuditLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)

        if request.method in WRITE_METHODS:
            db = SessionLocal()
            try:
                log = models.AuditLog(
                    method=request.method,
                    path=str(request.url.path),
                    status_code=response.status_code,
                )
                db.add(log)
                db.commit()
            except Exception as e:
                print(f"Audit log error: {e}")
            finally:
                db.close()

        return response
```

**Step 3: Register Middleware in `backend/main.py`**
```python
from middleware.audit import AuditLoggingMiddleware
app.add_middleware(AuditLoggingMiddleware)
```

**Step 4: Run Alembic migration for the new table**
```powershell
alembic revision --autogenerate -m "Add audit_logs table"
alembic upgrade head
```

**Step 5: Commit**
```powershell
git add .
git commit -m "feat(backend): add AuditLog model and automatic request logging middleware"
git push origin main
```

---

## 📅 Day 9: API Integration & Real-Time Data

> [!IMPORTANT]
> **Pull latest before starting!**
> ```bash
> git pull origin main
> ```

### 👨‍💻 Developer 1: Connect Transaction Table to Live Backend
**Goal:** Replace any static/mock data in the dashboard with real API calls.

**Step 1: Create an API client singleton**
Create file `frontend/src/lib/apiClient.ts`:
```typescript
import axios from "axios";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token from cookie on each request
apiClient.interceptors.request.use((config) => {
  // Note: HttpOnly cookies are sent automatically by the browser
  return config;
});

// Global error handler
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

**Step 2: Update `TransactionTable.tsx` to use the API client**
Open `frontend/src/components/TransactionTable.tsx` and change the axios import line from:
```typescript
import axios from "axios";
```
to:
```typescript
import apiClient from "@/lib/apiClient";
```
And replace `axios.get(...)` with `apiClient.get(...)`.

**Step 3: Add `.env.local` for local development**
Create file `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Step 4: Commit**
```powershell
git add .
git commit -m "feat(frontend): centralize API calls with Axios client and interceptors"
git push origin main
```

---

### 👨‍💻 Developer 2: Global Audit Logging Enhancements
**Goal:** Add user email to audit logs by reading from the JWT token.

**Step 1: Update `backend/middleware/audit.py`**
Replace the entire file contents:
```python
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from database import SessionLocal
import models
import auth

WRITE_METHODS = {"POST", "PATCH", "PUT", "DELETE"}
SKIP_PATHS = {"/auth/login", "/auth/register", "/openapi.json", "/docs"}

class AuditLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)

        if request.method in WRITE_METHODS and request.url.path not in SKIP_PATHS:
            db = SessionLocal()
            user_email = None

            # Attempt to extract user from Authorization header
            try:
                auth_header = request.headers.get("Authorization", "")
                if auth_header.startswith("Bearer "):
                    token = auth_header.split(" ")[1]
                    payload = auth.decode_token(token)
                    if payload:
                        user_email = payload.get("sub")
            except Exception:
                pass

            try:
                log = models.AuditLog(
                    method=request.method,
                    path=str(request.url.path),
                    user_email=user_email,
                    status_code=response.status_code,
                )
                db.add(log)
                db.commit()
            except Exception as e:
                print(f"Audit log error: {e}")
            finally:
                db.close()

        return response
```

**Step 2: Commit**
```powershell
git add .
git commit -m "feat(backend): enhance audit logs with user email extracted from JWT"
git push origin main
```

---

### 👨‍💻 Developer 3: EasyOCR Local Test Setup
**Goal:** Verify EasyOCR is working locally and create a test script for the team.

**Step 1: Install dependencies (if not already done)**
```powershell
pip install easyocr opencv-python-headless pillow
pip freeze > requirements.txt
```

**Step 2: Create OCR Test Script**
Create file `backend/scripts/test_ocr.py`:
```python
"""
Quick sanity test for the EasyOCR pipeline.
Usage: python scripts/test_ocr.py <path_to_image>
"""
import sys
import easyocr
import cv2
import numpy as np
import re

def test_ocr(image_path: str):
    print(f"Testing OCR on: {image_path}")

    # 1. Load image
    img = cv2.imread(image_path)
    if img is None:
        print("[ERROR] Could not load image. Check the path.")
        return

    # 2. Check quality
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blur_score = cv2.Laplacian(gray, cv2.CV_64F).var()
    print(f"Blur score (>100 = good quality): {blur_score:.2f}")

    if blur_score < 100:
        print("[WARNING] Image may be too blurry for reliable OCR.")

    # 3. Run OCR
    print("Running EasyOCR (this may take ~30 seconds on CPU)...")
    reader = easyocr.Reader(["en"], gpu=False)
    with open(image_path, "rb") as f:
        results = reader.readtext(f.read(), detail=0)

    full_text = " ".join(results)
    print(f"\nExtracted Text:\n  {full_text}")

    # 4. Parse identity patterns
    pan = re.search(r"\b[A-Z]{5}[0-9]{4}[A-Z]\b", full_text)
    aadhaar = re.search(r"\b[2-9]\d{3}\s\d{4}\s\d{4}\b", full_text)

    if pan:
        print(f"\n✅ PAN Card Detected: {pan.group(0)}")
    elif aadhaar:
        print(f"\n✅ Aadhaar Card Detected: {aadhaar.group(0)}")
    else:
        print("\n⚠ No known ID pattern found.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python scripts/test_ocr.py <path_to_image>")
        sys.exit(1)
    test_ocr(sys.argv[1])
```

**Step 3: Commit**
```powershell
git add .
git commit -m "chore(infra): add EasyOCR test script and confirm dev dependencies"
git push origin main
```

---

## 📅 Day 10: Rate Limiting, Security Review & Dataset Validation

> [!IMPORTANT]
> **Pull latest before starting!**
> ```bash
> git pull origin main
> ```

### 👨‍💻 Developer 1: Server-Side Pagination & Filter UI
**Goal:** Add server-side pagination controls to the Transaction History page.

**Step 1: Add a Pagination Hook**
Create file `frontend/src/hooks/usePagination.ts`:
```typescript
import { useState } from "react";

export function usePagination(initialPage = 1, initialPageSize = 20) {
  const [page, setPage] = useState(initialPage);
  const [pageSize] = useState(initialPageSize);

  const nextPage = () => setPage((p) => p + 1);
  const prevPage = () => setPage((p) => Math.max(1, p - 1));
  const goToPage = (n: number) => setPage(n);
  const reset = () => setPage(1);

  return { page, pageSize, nextPage, prevPage, goToPage, reset };
}
```

**Step 2: Add a Search Input to `TransactionTable`**
In `frontend/src/components/TransactionTable.tsx`, add a search state and input above the table:
```tsx
const [search, setSearch] = useState("");

// Add inside the header div alongside the filter select:
<input
  type="text"
  placeholder="Search by ID..."
  className="bg-brand-surface border border-brand-border text-sm text-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-primary"
  value={search}
  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
/>
```

**Step 3: Commit**
```powershell
git add .
git commit -m "feat(frontend): add search input and reusable pagination hook for tables"
git push origin main
```

---

### 👨‍💻 Developer 2: Redis Rate Limiting on APIs
**Goal:** Protect expensive endpoints from abuse using Redis-backed IP rate limiting.

**Step 1: Install slowapi**
```powershell
pip install slowapi
pip freeze > requirements.txt
```

**Step 2: Configure Rate Limiter in `backend/main.py`**
Replace the top of `backend/main.py` with the updated version:
```python
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from routers import auth, transactions, merchants
from middleware.audit import AuditLoggingMiddleware

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="FinAI Core API", version="1.0.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

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
@limiter.limit("10/minute")
def read_analyst_data(request: Request):
    return {"message": "Fraud queue metadata — rate limited."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
```

**Step 3: Commit**
```powershell
git add .
git commit -m "feat(backend): add Redis-backed rate limiting via slowapi"
git push origin main
```

---

### 👨‍💻 Developer 3: Validate Synthetic Dataset Distribution
**Goal:** Run statistical checks on the 100k records to confirm the fraud patterns make sense.

**Step 1: Create Validation Script**
Create file `backend/scripts/validate_data.py`:
```python
import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal
import models

def validate():
    db = SessionLocal()
    try:
        total = db.query(models.Transaction).count()
        success = db.query(models.Transaction).filter(models.Transaction.status == "success").count()
        failed = db.query(models.Transaction).filter(models.Transaction.status == "failed").count()
        pending = db.query(models.Transaction).filter(models.Transaction.status == "pending").count()

        high_fraud = db.query(models.Transaction).filter(models.Transaction.fraud_score >= 70).count()

        print(f"=== Dataset Validation Report ===")
        print(f"Total Records   : {total:,}")
        print(f"Success         : {success:,} ({success/total*100:.1f}%)")
        print(f"Pending         : {pending:,} ({pending/total*100:.1f}%)")
        print(f"Failed          : {failed:,} ({failed/total*100:.1f}%)")
        print(f"High Fraud (≥70): {high_fraud:,} ({high_fraud/total*100:.1f}%)")

        # Sanity assertions
        assert success / total > 0.60, "Expected >60% success rate"
        assert high_fraud / total < 0.15, "Fraud rate seems unrealistically high"

        print("\n✅ All distribution checks passed!")
    finally:
        db.close()

if __name__ == "__main__":
    validate()
```

**Step 2: Run it**
```powershell
python scripts/validate_data.py
```

**Step 3: Commit**
```powershell
git add .
git commit -m "chore(infra): add dataset distribution validation script"
git push origin main
```

---

## 📅 Day 11: Real-Time Charts & WebSocket Setup

> [!IMPORTANT]
> **Pull latest before starting!**
> ```bash
> git pull origin main
> ```

### 👨‍💻 Developer 1: Recharts Revenue & Volume Chart Components
**Goal:** Build polished, animated Recharts components for revenue and transaction volume.

**Step 1: Create the Chart Components File**
Create file `frontend/src/components/Charts.tsx`:
```tsx
"use client";

import { useEffect, useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend
} from "recharts";
import apiClient from "@/lib/apiClient";

export function RevenueChart() {
  const [data, setData] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Fetch real aggregated data from backend (will be built in Day 13)
    // For now use mock data that matches the expected shape
    const mock = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((day, i) => ({
      day,
      revenue: 50000 + i * 12000 + Math.random() * 20000,
      volume: 400 + i * 80,
    }));
    setData(mock);
  }, []);

  if (!mounted) return <div className="h-72 bg-slate-900/30 animate-pulse rounded-xl" />;

  return (
    <div className="card space-y-3">
      <div>
        <h3 className="font-bold text-slate-100">Revenue Stream</h3>
        <p className="text-xs text-slate-400">Last 7 days — Updated in real-time</p>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
            <XAxis dataKey="day" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
            <Tooltip contentStyle={{ backgroundColor: "#0B0F19", borderColor: "#1E293B", borderRadius: "12px" }} />
            <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#gradRevenue)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function VolumeChart() {
  const [data, setData] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mock = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((day, i) => ({
      day,
      success: 300 + i * 40,
      failed: 20 + Math.round(Math.random() * 15),
    }));
    setData(mock);
  }, []);

  if (!mounted) return <div className="h-72 bg-slate-900/30 animate-pulse rounded-xl" />;

  return (
    <div className="card space-y-3">
      <div>
        <h3 className="font-bold text-slate-100">Transaction Volume</h3>
        <p className="text-xs text-slate-400">Success vs Failed breakdown</p>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
            <XAxis dataKey="day" stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748B" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ backgroundColor: "#0B0F19", borderColor: "#1E293B", borderRadius: "12px" }} />
            <Legend />
            <Bar dataKey="success" name="Success" fill="#10B981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="failed" name="Failed" fill="#EF4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
```

**Step 2: Add charts to `merchant/dashboard/page.tsx`**
```tsx
import { RevenueChart, VolumeChart } from "@/components/Charts";

// Add inside JSX, in the grid section:
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <RevenueChart />
  <VolumeChart />
</div>
```

**Step 3: Commit**
```powershell
git add .
git commit -m "feat(frontend): add RevenueChart and VolumeChart recharts components"
git push origin main
```

---

### 👨‍💻 Developer 2: FastAPI WebSocket Manager
**Goal:** Build the backend infrastructure for real-time event broadcasting.

**Step 1: Create WebSocket Manager**
Create file `backend/websockets/manager.py`:
```python
from fastapi import WebSocket
from typing import List

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"WebSocket connected. Total clients: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        print(f"WebSocket disconnected. Total clients: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        import json
        data = json.dumps(message)
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(data)
            except Exception:
                disconnected.append(connection)
        for conn in disconnected:
            self.active_connections.remove(conn)

manager = ConnectionManager()
```

**Step 2: Add WebSocket route to `backend/main.py`**
```python
from fastapi import WebSocket, WebSocketDisconnect
from websockets.manager import manager

@app.websocket("/ws/alerts")
async def websocket_alerts(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive — broadcasts come from other parts of the system
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
```

**Step 3: Commit**
```powershell
git add .
git commit -m "feat(backend): add WebSocket connection manager and /ws/alerts endpoint"
git push origin main
```

---

### 👨‍💻 Developer 3: Isolation Forest Fraud Detection Model
**Goal:** Train the first ML model for unsupervised fraud detection using Isolation Forest.

**Step 1: Install dependencies**
```powershell
pip install scikit-learn joblib
pip freeze > requirements.txt
```

**Step 2: Create model training script**
Create file `backend/ml/train_isolation_forest.py`:
```python
"""
Train Isolation Forest on the synthetic transaction dataset.
Run this once after the database is populated with synthetic data.
"""
import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import joblib
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import LabelEncoder
from database import SessionLocal
import models

MODEL_PATH = os.path.join(os.path.dirname(__file__), "isolation_forest.pkl")

def train():
    db = SessionLocal()
    try:
        print("Fetching transactions from database...")
        transactions = db.query(models.Transaction).all()

        if not transactions:
            print("[ERROR] No transactions found. Run generate_data.py first.")
            return

        # Feature engineering: amount and status (encoded)
        le = LabelEncoder()
        statuses = [t.status for t in transactions]
        le.fit(statuses)

        X = np.array([
            [t.amount, le.transform([t.status])[0]]
            for t in transactions
        ])

        print(f"Training Isolation Forest on {len(X):,} samples...")
        model = IsolationForest(
            n_estimators=100,
            contamination=0.05,  # Expect ~5% anomalies
            random_state=42,
            n_jobs=-1
        )
        model.fit(X)

        # Save model and encoder
        joblib.dump({"model": model, "label_encoder": le}, MODEL_PATH)
        print(f"\n✅ Model saved to: {MODEL_PATH}")

        # Quick self-test
        scores = model.decision_function(X)
        predictions = model.predict(X)
        anomaly_count = (predictions == -1).sum()
        print(f"Detected {anomaly_count:,} anomalies ({anomaly_count/len(X)*100:.1f}%)")

    finally:
        db.close()

if __name__ == "__main__":
    train()
```

**Step 3: Run the training**
```powershell
python ml/train_isolation_forest.py
```

**Step 4: Commit**
```powershell
git add .
git commit -m "feat(ml): add Isolation Forest training script for unsupervised fraud detection"
git push origin main
```

---

## 📅 Day 12: Real-Time Alerts & XGBoost Training

> [!IMPORTANT]
> **Pull latest before starting!**
> ```bash
> git pull origin main
> ```

### 👨‍💻 Developer 1: Toast Notification Alert Component
**Goal:** Build a real-time alert UI that receives WebSocket messages and displays them.

**Step 1: Create Toast Notification Component**
Create file `frontend/src/components/ToastAlert.tsx`:
```tsx
"use client";

import { useEffect, useState } from "react";
import { ShieldAlert, CheckCircle2, X } from "lucide-react";

interface Toast {
  id: number;
  message: string;
  type: "fraud" | "success" | "info";
}

export default function ToastAlert() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws/alerts");

    ws.onopen = () => console.log("WebSocket connected to FinAI alert stream");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const newToast: Toast = {
        id: Date.now(),
        message: data.message || "New alert received",
        type: data.type || "info",
      };
      setToasts((prev) => [newToast, ...prev.slice(0, 4)]); // max 5 toasts

      // Auto-dismiss after 6 seconds
      setTimeout(() => removeToast(newToast.id), 6000);
    };

    ws.onerror = (e) => console.error("WebSocket error:", e);

    return () => ws.close();
  }, []);

  const icons = {
    fraud: <ShieldAlert className="h-5 w-5 text-rose-400 shrink-0" />,
    success: <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />,
    info: <ShieldAlert className="h-5 w-5 text-indigo-400 shrink-0" />,
  };

  const styles = {
    fraud: "bg-rose-500/10 border-rose-500/30 text-rose-300",
    success: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
    info: "bg-indigo-500/10 border-indigo-500/30 text-indigo-300",
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col-reverse gap-2 w-80">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 rounded-xl border p-4 text-xs font-medium shadow-lg backdrop-blur-md animate-fade-in ${styles[toast.type]}`}
        >
          {icons[toast.type]}
          <span className="flex-1">{toast.message}</span>
          <button onClick={() => removeToast(toast.id)} className="text-slate-400 hover:text-white">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
```

**Step 2: Add `ToastAlert` to global layout**
Open `frontend/src/app/layout.tsx` and add:
```tsx
import ToastAlert from "@/components/ToastAlert";

// Inside the body, after the main content:
<ToastAlert />
```

**Step 3: Commit**
```powershell
git add .
git commit -m "feat(frontend): add WebSocket-powered real-time toast alert notification system"
git push origin main
```

---

### 👨‍💻 Developer 2: WebSocket Alert Broadcast on High Fraud
**Goal:** When a new high-fraud transaction is detected, broadcast an alert to all connected dashboards.

**Step 1: Create Fraud Alert Endpoint**
Open `backend/routers/transactions.py` and append:
```python
from fastapi import BackgroundTasks
from websockets.manager import manager
import asyncio

@router.post("/flag-fraud")
async def flag_fraud_transaction(
    transaction_id: int,
    fraud_score: int,
    db: Session = Depends(get_db)
):
    txn = db.query(models.Transaction).filter(models.Transaction.id == transaction_id).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")

    txn.fraud_score = fraud_score
    db.commit()

    # Broadcast alert to all connected WebSocket clients
    await manager.broadcast({
        "type": "fraud",
        "message": f"🚨 High fraud risk detected on Transaction #{transaction_id} — Score: {fraud_score}/100",
        "transaction_id": transaction_id,
        "score": fraud_score
    })

    return {"message": "Transaction flagged and alert broadcasted"}
```

**Step 2: Commit**
```powershell
git add .
git commit -m "feat(backend): broadcast real-time fraud alert via WebSocket when flagging high-score transactions"
git push origin main
```

---

### 👨‍💻 Developer 3: XGBoost Fraud Detection Training
**Goal:** Train a supervised XGBoost model using the `fraud_score` labels in the synthetic dataset.

**Step 1: Install dependencies**
```powershell
pip install xgboost scikit-learn joblib
pip freeze > requirements.txt
```

**Step 2: Create XGBoost Training Script**
Create file `backend/ml/train_xgboost.py`:
```python
"""
Supervised fraud detection using XGBoost on the synthetic dataset.
Transactions with fraud_score >= 70 are labeled as fraudulent.
"""
import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score
from sklearn.preprocessing import LabelEncoder
import xgboost as xgb
from database import SessionLocal
import models

MODEL_PATH = os.path.join(os.path.dirname(__file__), "xgboost_fraud.pkl")

def train():
    db = SessionLocal()
    try:
        print("Loading transactions from database...")
        transactions = db.query(models.Transaction).all()

        if len(transactions) < 100:
            print("[ERROR] Insufficient data. Run generate_data.py first (100k records).")
            return

        le = LabelEncoder()
        statuses = [t.status for t in transactions]
        le.fit(statuses)

        X = np.array([
            [t.amount, le.transform([t.status])[0]]
            for t in transactions
        ])
        # Label: 1 = fraud (score >= 70), 0 = legitimate
        y = np.array([1 if t.fraud_score >= 70 else 0 for t in transactions])

        print(f"Dataset: {len(X):,} records — {y.sum():,} fraud ({y.mean()*100:.1f}%)")

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)

        print("Training XGBoost classifier...")
        model = xgb.XGBClassifier(
            n_estimators=200,
            max_depth=6,
            learning_rate=0.1,
            use_label_encoder=False,
            eval_metric="logloss",
            scale_pos_weight=(y == 0).sum() / (y == 1).sum(),
            random_state=42,
        )
        model.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=50)

        # Evaluation
        y_pred = model.predict(X_test)
        y_proba = model.predict_proba(X_test)[:, 1]
        auc = roc_auc_score(y_test, y_proba)

        print("\n=== Model Performance ===")
        print(f"AUC-ROC: {auc:.4f}")
        print(classification_report(y_test, y_pred, target_names=["Legitimate", "Fraud"]))

        joblib.dump({"model": model, "label_encoder": le}, MODEL_PATH)
        print(f"\n✅ XGBoost model saved to: {MODEL_PATH}")

    finally:
        db.close()

if __name__ == "__main__":
    train()
```

**Step 3: Run training**
```powershell
python ml/train_xgboost.py
```

**Step 4: Commit**
```powershell
git add .
git commit -m "feat(ml): train supervised XGBoost fraud classifier on 100k synthetic records"
git push origin main
```
