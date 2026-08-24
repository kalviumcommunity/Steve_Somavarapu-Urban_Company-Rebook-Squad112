# 🐳 Docker Deployment Guide — Urban Company Rebook

This project provides a full Docker setup for containerized local development and production deployment with **JWT Authentication** (email & password).

---

## 📦 Architecture

| Service | Technology | Port (Host) | Internal Port | Description |
| :--- | :--- | :--- | :--- | :--- |
| **`postgres`** | PostgreSQL 16 (Alpine) | `5432` | `5432` | Primary relational database with persistent volume storage |
| **`backend`** | Node.js 20 Express + Prisma (JWT Auth) | `5000` | `5000` | REST API backend with JWT email & password auth |
| **`frontend`** | React 19 + Vite (Nginx Alpine) | `5173` | `80` | Production SPA with Nginx client-side routing & caching |

---

## 🚀 Quick Start (Production Setup)

### 1. Build and Start All Services
```bash
docker compose up --build -d
```

### 2. Access the Application
- **Frontend App**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **PostgreSQL Database**: `localhost:5432` (`postgres` / `postgres`)

### 3. Demo Credentials
- **Email**: `test@urbancompany.com`
- **Password**: `password123`

---

## 🛠️ Useful Docker Commands

### View Logs
```bash
docker compose logs -f
```

### Stop Services
```bash
docker compose down
```

### Stop and Wipe Volumes (Reset Database)
```bash
docker compose down -v
```

### Seed the Database Inside the Container
```bash
docker compose exec backend npx prisma db seed
```

---

## 💻 Development Mode (Live Reloading)

```bash
docker compose -f docker-compose.dev.yml up --build
```
