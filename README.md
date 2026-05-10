# AI-Enhanced Pneumonia Detection Platform

> **⚠️ Medical Disclaimer:** This application is a screening aid only and is **not a medical diagnosis tool**. All outputs must be reviewed by a qualified clinician before any clinical decision is made.

A full-stack web application that uses a fine-tuned **DenseNet121** deep learning model to classify chest X-rays as **Normal** or **Pneumonia**, with **Grad-CAM heatmap** visualization, **PDF report generation**, **JWT-based authentication**, and **role-based access control** (patient / admin).

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Quick Start — Local](#quick-start--local)
- [Quick Start — GitHub Codespaces](#quick-start--github-codespaces)
- [API Reference](#api-reference)
- [Model Information](#model-information)
- [Docker](#docker)
- [Configuration Reference](#configuration-reference)
- [Notes & Caveats](#notes--caveats)

---

## Features

- 🩻 **X-Ray Upload & Inference** — Upload PNG/JPG chest X-rays and get instant predictions with confidence scores
- 🔥 **Grad-CAM Heatmaps** — Visual explanation overlays showing which regions of the X-ray influenced the prediction
- 📄 **PDF Report Generation** — Downloadable PDF reports per scan including image, heatmap, prediction details, and disclaimer
- 🔐 **JWT Authentication** — Stateless token-based auth with configurable expiration
- 👥 **Role-Based Access Control** — `patient` and `admin` roles with separate dashboards and permissions
- 🗃️ **Scan History** — Authenticated users can view, revisit, and delete their past scans
- 🛠️ **Admin Dashboard** — Admins can view all users and all scans across the platform
- 🐳 **Docker Support** — Containerised deployment with `docker-compose`
- ☁️ **Codespaces-Ready** — Works out of the box in GitHub Codespaces

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite 5, Tailwind CSS 3, React Router v6, Axios |
| Backend | Python 3, Flask 3, Flask-SQLAlchemy, Flask-Bcrypt, Flask-CORS |
| ML / Vision | TensorFlow 2.16, Keras, OpenCV, NumPy, Pillow |
| Auth | PyJWT 2.8 |
| Reports | ReportLab |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Deployment | Gunicorn, Docker, docker-compose |

---

## Project Structure

```
Pneumonia-Detection-Webapp-Project/
├── backend/
│   ├── app.py                  # Flask application factory
│   ├── config.py               # Configuration class (reads .env)
│   ├── extensions.py           # SQLAlchemy & Bcrypt instances
│   ├── requirements.txt        # Python dependencies
│   ├── Dockerfile              # Backend container definition
│   ├── Procfile                # Heroku / Render process file
│   ├── runtime.txt             # Python version pin
│   ├── .env.example            # Environment variable template
│   ├── models/
│   │   ├── user.py             # User ORM model
│   │   └── scan.py             # Scan ORM model
│   ├── routes/
│   │   ├── auth.py             # /auth/register, /auth/login
│   │   ├── scan.py             # /scan/upload, /scan/history, /scan/<id>
│   │   ├── report.py           # /report/<scan_id>
│   │   └── admin.py            # /admin/users, /admin/scans
│   ├── services/
│   │   ├── inference.py        # Model loading & prediction
│   │   ├── gradcam.py          # Grad-CAM heatmap generation
│   │   └── pdf_service.py      # PDF report builder
│   ├── utils/
│   │   ├── auth_helpers.py     # JWT helpers, login_required, admin_required decorators
│   │   └── file_utils.py       # File handling utilities
│   ├── models_saved/           # Place pneumoniaModel.h5 here (git-ignored)
│   ├── uploads/                # Saved X-ray images (auto-created)
│   └── heatmaps/               # Grad-CAM outputs (auto-created)
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── .env.example
│   └── src/                    # React components, pages, hooks
├── docs/                       # Project notes, API notes, diagrams
├── docker-compose.yml
└── README.md
```

---

## Prerequisites

| Requirement | Version |
|-------------|---------|
| Python | 3.10+ |
| Node.js | 18+ |
| npm | 9+ |
| Git | any |

> For Docker usage only: Docker Desktop 24+ with compose v2.

---

## Environment Setup

### Backend `.env`

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
SECRET_KEY=replace-this-with-a-long-random-secret
DATABASE_URI=sqlite:///pneumonia.db
JWT_EXPIRATION_HOURS=24

ADMIN_REGISTRATION_KEY=replace-with-your-admin-key

# Local:             http://localhost:5173
# GitHub Codespaces: https://<codespace-name>-5173.app.github.dev
# Production:        https://your-frontend.vercel.app
CORS_ORIGINS=http://localhost:5173

MODEL_GOOGLE_DRIVE_ID=1cB7YkVU6CBMU6AS7rHxnyrVG6OaDgjTe
MODEL_PREPROCESS_MODE=rescale_255
GRADCAM_LAYER_NAME=relu
MODEL_VERSION=DenseNet121-pneumonia-v1

MAX_CONTENT_LENGTH=10485760
```

### Frontend `.env`

```bash
cp frontend/.env.example frontend/.env
```

Set `VITE_API_BASE_URL` to your backend URL.

### Trained Model

Place the trained model file at:
```
backend/models_saved/pneumoniaModel.h5
```
If the file is not present on startup, the backend will attempt to auto-download it from Google Drive using the `MODEL_GOOGLE_DRIVE_ID` value in `.env`.

---

## Quick Start — Local

### 1. Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
flask run --host=0.0.0.0 --port=5000
```

Backend is now running at `http://localhost:5000`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend is now running at `http://localhost:5173`.

---

## Quick Start — GitHub Codespaces

Open **two terminals** inside the Codespace and run each block in its own terminal.

### Terminal 1 — Backend

```bash
cd /workspaces/Pneumonia-Detection-Webapp-Project
git pull origin Frontend_updates --no-rebase
source backend/venv/bin/activate
cd backend && flask run --host=0.0.0.0 --port=5000
```

### Terminal 2 — Frontend

```bash
cd /workspaces/Pneumonia-Detection-Webapp-Project/frontend
npm run dev
```

### Port Visibility

After both servers are running, open the **PORTS** tab in Codespaces:

| Port | Service | Action |
|------|---------|--------|
| 5000 | Flask backend | Right-click → Port Visibility → **Public** |
| 5173 | Vite frontend | Click the 🌐 globe icon to open in browser |

> **Why set port 5000 to Public?**  
> The frontend (running in your browser) makes API calls directly to the backend. If port 5000 is private, the browser will get a 403 when trying to reach it.

---

## API Reference

All authenticated routes require the header:
```
Authorization: Bearer <token>
```

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | ❌ | Register a new user (`patient` or `admin`) |
| POST | `/auth/login` | ❌ | Login and receive a JWT token |

**Register body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securepassword",
  "role": "patient"
}
```

**Login body:**
```json
{
  "email": "jane@example.com",
  "password": "securepassword"
}
```

---

### Scans

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/scan/upload` | ✅ | Upload an X-ray image for inference |
| GET | `/scan/history` | ✅ | Get the authenticated user's scan history |
| GET | `/scan/<id>` | ✅ | Get details for a specific scan |
| DELETE | `/scan/<id>` | ✅ | Delete a scan (patient owns it, or admin) |

**Upload form-data fields:**
- `image` — PNG, JPG, or JPEG file
- `save_scan` — `"true"` (default) or `"false"` to skip saving to history

**Upload response includes:**
- `prediction.predicted_label` — `"Normal"` or `"Pneumonia"`
- `prediction.confidence` — float 0–1
- `prediction.normal_probability` / `prediction.pneumonia_probability`
- `files.image_url`, `files.heatmap_url`, `files.overlay_url`

---

### Reports

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/report/<scan_id>` | ✅ | Download PDF report for a scan |

---

### Admin

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin/users` | ✅ Admin | List all registered users |
| GET | `/admin/scans` | ✅ Admin | List all scans (filterable by `label`, `user_id`) |
| GET | `/admin/scans/<id>` | ✅ Admin | Get full scan detail with user info |

---

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Backend status check |
| GET | `/health` | Returns `{"status": "healthy"}` |

---

## Model Information

| Property | Value |
|----------|-------|
| Architecture | DenseNet121 (fine-tuned) |
| Classes | Normal, Pneumonia |
| Input | Chest X-ray (PNG/JPG/JPEG) |
| Preprocessing | Pixel rescaling to [0, 1] (`rescale_255` mode) |
| Grad-CAM layer | `relu` (configurable via `GRADCAM_LAYER_NAME`) |
| Model version tag | `DenseNet121-pneumonia-v1` |
| File location | `backend/models_saved/pneumoniaModel.h5` |

The model was trained on chest X-ray data. Performance metrics and training details are documented in `docs/`.

---

## Docker

Build and run the full stack with Docker Compose:

```bash
docker-compose up --build
```

This starts:
- `backend` on port `5000`
- `frontend` on port `5173`

To stop:
```bash
docker-compose down
```

---

## Configuration Reference

All backend config is driven by environment variables (see `backend/config.py`):

| Variable | Default | Description |
|----------|---------|-------------|
| `SECRET_KEY` | `change-me-now` | Flask secret key — **change in production** |
| `DATABASE_URI` | SQLite `pneumonia.db` | SQLAlchemy DB URI; supports PostgreSQL |
| `JWT_EXPIRATION_HOURS` | `24` | JWT token lifetime in hours |
| `ADMIN_REGISTRATION_KEY` | `team-admin-key` | Key required to register as admin |
| `CORS_ORIGINS` | `http://localhost:5173` | Comma-separated allowed origins |
| `MODEL_GOOGLE_DRIVE_ID` | (set) | Google Drive file ID for auto-downloading model |
| `MODEL_PREPROCESS_MODE` | `rescale_255` | Preprocessing mode for inference |
| `GRADCAM_LAYER_NAME` | `relu` | Target layer for Grad-CAM |
| `MODEL_VERSION` | `DenseNet121-pneumonia-v1` | Version tag stored with each scan |
| `MAX_CONTENT_LENGTH` | `10485760` (10 MB) | Maximum upload file size in bytes |

---

## Notes & Caveats

- **SQLite vs PostgreSQL** — SQLite is used by default for local development. For production, set `DATABASE_URI` to a `postgresql://` connection string (the app normalises `postgres://` automatically).
- **Uploads & heatmaps** — The `backend/uploads/` and `backend/heatmaps/` directories are created automatically on first run. They are **not committed to Git**.
- **Model file** — `backend/models_saved/pneumoniaModel.h5` is **not committed** to Git due to file size. It will be auto-downloaded from Google Drive on first inference if missing.
- **Allowed image types** — PNG, JPG, JPEG only. Max 10 MB per upload.
- **CORS in Codespaces** — When running in Codespaces, update `CORS_ORIGINS` in `backend/.env` to the full Codespaces URL for port 5173 (e.g., `https://<codespace-name>-5173.app.github.dev`).
