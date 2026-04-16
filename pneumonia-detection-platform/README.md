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
