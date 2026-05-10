# AI-Enhanced Pneumonia Detection Platform

A full-stack web application for AI-powered pneumonia screening from chest X-rays, with Grad-CAM heatmap visualization, PDF report generation, JWT authentication, and role-based access control.

## Structure

- `frontend/` — React + Vite app
- `backend/` — Flask API, model inference, Grad-CAM, PDF report generation
- `docs/` — project notes, API notes, screenshots

---

## Quick Start — Local

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS / Linux
pip install -r requirements.txt
flask run --host=0.0.0.0 --port=5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## Quick Start — GitHub Codespaces

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

Set port **5000** to **Public** by right-clicking it → Port Visibility → Public.  
Then click the globe icon on port **5173** to open the app in your browser.

---

## Notes

- Put your trained model in `backend/models_saved/pneumoniaModel.h5`
- Uploaded X-rays are saved to `backend/uploads/`
- Grad-CAM outputs are saved to `backend/heatmaps/`
- SQLite database is created automatically on first run
- Copy `backend/.env.example` to `backend/.env` and fill in your values before starting
