# AI-Enhanced Pneumonia Detection Platform

This repository contains a simple full-stack scaffold for an AI-enhanced pneumonia detection web app.

## Structure
- frontend/ -> React + Vite + Tailwind app
- backend/ -> Flask API + model inference + Grad-CAM + PDF report
- docs/ -> project notes, API notes, screenshots

## Quick Start
### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Notes
- Put your trained model in `backend/models_saved/pneumoniaModel.h5`
- Uploaded X-rays go into `backend/uploads/`
- Grad-CAM outputs go into `backend/heatmaps/`
- SQLite DB will be created automatically

---

## GitHub Codespaces Quick Start

Open two terminals inside the Codespace and run each block in its own terminal.

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

### Port visibility
After both servers are running, open the **PORTS** tab in Codespaces:

| Port | Service | Visibility |
|------|---------|------------|
| 5000 | Flask backend | **Public** |
| 5173 | Vite frontend | Private (open in browser) |

Right-click port **5000** → Port Visibility → **Public**.  
Then click the globe icon on port **5173** to open the app in your browser.
