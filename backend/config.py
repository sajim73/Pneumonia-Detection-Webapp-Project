import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwt-secret")
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///pneumonia.db")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    UPLOAD_FOLDER = "uploads"
    HEATMAP_FOLDER = "heatmaps"
    REPORT_FOLDER = "reports"
    MODEL_PATH = os.getenv("MODEL_PATH", "models_saved/pneumoniaModel.h5")
    MAX_CONTENT_LENGTH = 10 * 1024 * 1024
