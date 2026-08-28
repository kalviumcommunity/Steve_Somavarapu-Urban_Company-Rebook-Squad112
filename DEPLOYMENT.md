# Deployment Guide: Render (Backend + Database) & Vercel (Frontend)

This guide provides step-by-step instructions to deploy the **Urban Company One-Click Rebooking** system.

---

## Architecture Overview
- **Frontend**: Hosted on [Vercel](https://vercel.com) (Vite + React SPA)
- **Backend API**: Hosted on [Render](https://render.com) (Node.js + Express + Prisma)
- **Database**: Hosted on [Render PostgreSQL](https://render.com) (or Supabase / Neon)

---

## Part 1: Deploy Database on Render

1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** → **PostgreSQL**.
2. Fill in the details:
   - **Name**: `urban-company-rebook-db`
   - **Database**: `urban_company_rebook`
   - **User**: `postgres`
   - **Region**: Choose closest to you (e.g., Singapore / Oregon / Frankfurt)
   - **Plan**: Free
3. Click **Create Database**.
4. Once created, copy the **Internal Database URL** (if deploying backend on Render) or **External Database URL**.

---

## Part 2: Deploy Backend to Render

1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** → **Web Service**.
2. Connect your GitHub Repository: `Steve_Somavarapu-Urban_Company-Rebook-Squad112`.
3. Configure the Web Service settings:
   - **Name**: `urban-company-rebook-backend`
   - **Region**: Same region as your database
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**:
     ```bash
     npm install && npx prisma generate && npx prisma db push && npm run db:seed
     ```
   - **Start Command**:
     ```bash
     npm start
     ```
   - **Plan**: Free

4. Add **Environment Variables** under the **Environment** tab:
   | Key | Value / Example | Notes |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Production mode |
   | `PORT` | `5000` | Render automatically binds or provides `$PORT` |
   | `DATABASE_URL` | `postgresql://...` | Connection string from Step 1 |
   | `JWT_SECRET` | `your_super_secret_jwt_key_here` | 32+ character random string |
   | `FRONTEND_URL` | `https://your-frontend.vercel.app` | Or `*` during initial testing |

5. Click **Create Web Service**.
6. Render will build, generate Prisma client, push DB schema, run seed data, and start the API server.
7. Copy your backend URL: e.g., `https://urban-company-rebook-backend.onrender.com`.
8. Test health endpoint in browser: `https://urban-company-rebook-backend.onrender.com/api/health`.

---

## Part 3: Deploy Frontend to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New...** → **Project**.
2. Import your GitHub repository: `Steve_Somavarapu-Urban_Company-Rebook-Squad112`.
3. Configure the Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click **Edit** and select `frontend`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `dist` (default)
   - **Install Command**: `npm install` (default)

4. Under **Environment Variables**, add:
   | Key | Value |
   | :--- | :--- |
   | `VITE_API_BASE_URL` | `https://urban-company-rebook-backend.onrender.com` (Your Render Backend URL) |

5. Click **Deploy**.
6. Vercel will build and deploy the React application.
7. SPA routing is automatically handled via [`frontend/vercel.json`](./frontend/vercel.json).

---

## Part 4: Connect & Verify

1. Update the `FRONTEND_URL` environment variable on Render with your newly assigned Vercel URL (e.g., `https://urban-company-rebook-squad112.vercel.app`).
2. Open your Vercel app in the browser.
3. Log in with the pre-seeded demo accounts:
   - **Customer**: `test@urbancompany.com` / `password123`
   - **Past Customer (Suresh)**: `suresh.kumar@example.com` / `password123`
4. Test the One-Click Rebooking flow!
