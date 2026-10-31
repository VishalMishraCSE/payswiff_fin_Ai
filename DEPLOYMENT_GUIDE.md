# FinAI Free Lifetime Deployment Guide

This guide explains how to deploy FinAI (Frontend, Backend, and Database) with **100% Free Lifetime Hosting** across reliable platforms.

---

## Architecture Overview

| Component | Platform | Free Tier Specifications |
| :--- | :--- | :--- |
| **Database** | **[Neon.tech](https://neon.tech)** | Lifetime free Serverless PostgreSQL (0.5 GB, SSL, automated backups, no credit card required) |
| **Backend API** | **[Render.com](https://render.com)** | Lifetime free Web Service (Python 3.12 FastAPI, 750 free hours/mo, automatic HTTPS) |
| **Frontend** | **[Vercel.com](https://vercel.com)** | Lifetime free Next.js Hosting (Edge CDN, automatic CI/CD on git push, free SSL) |

---

## Step 1: Create Free Database on Neon.tech (2 Minutes)

1. Sign up for free at **[https://console.neon.tech/signup](https://console.neon.tech/signup)** (Sign in with your GitHub account).
2. Click **Create Project**, name it `finai-db`, and choose any region close to you (e.g., Singapore, Frankfurt, or US East).
3. Under **Connection Details**, copy your **Connection String**. It looks like:
   ```text
   postgresql://username:password@ep-xxxxxx.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```
4. Save this `DATABASE_URL` — FinAI will automatically create all tables and seed default users on its very first startup!

---

## Step 2: Deploy Backend on Render.com (3 Minutes)

1. Sign up / Log in to **[https://dashboard.render.com](https://dashboard.render.com)** with your GitHub account (`VishalMishraCSE`).
2. Click **New +** -> **Web Service**.
3. Select your repository: **`VishalMishraCSE/payswiff_fin_Ai`**.
4. Configure the service settings:
   - **Name**: `finai-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install --upgrade pip && pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: `Free`
5. Scroll down to **Environment Variables** and add:
   - `DATABASE_URL`: *(Paste your Neon connection string from Step 1)*
   - `GEMINI_API_KEY`: *(Your Google Gemini API Key)*
6. Click **Deploy Web Service**.
7. Once deployment finishes (takes ~2 minutes), copy your Render Backend URL, e.g.:
   `https://finai-backend.onrender.com`

---

## Step 3: Deploy Frontend on Vercel (2 Minutes)

1. Go to **[https://vercel.com/new](https://vercel.com/new)** and log in with GitHub.
2. Under "Import Git Repository", import **`VishalMishraCSE/payswiff_fin_Ai`**.
3. In the project configuration:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click "Edit" and select **`frontend`**.
4. Expand **Environment Variables** and add:
   - `BACKEND_URL`: *(Your Render Backend URL, e.g. `https://finai-backend.onrender.com`)*
5. Click **Deploy**.

Within 60 seconds, your frontend will be live at:
`https://payswiff-fin-ai.vercel.app` (or your chosen Vercel URL)!

---

## Default Login Credentials
Once deployed, the database automatically initializes the following test accounts:
- **Merchant**: `merchant@payswiff.com` / `password123`
- **Customer Care**: `care@payswiff.com` / `password123`
- **Risk Analyst**: `analyst@payswiff.com` / `password123`
- **Admin**: `admin@payswiff.com` / `password123`
