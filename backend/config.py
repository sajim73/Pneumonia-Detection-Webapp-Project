import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")


def _normalize_database_url(url: str) -> str:
    if not url:
        return f"sqlite:///{BASE_DIR / 'pneumonia.db'}"
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql://", 1)
    return url


def _parse_origins(value: str):
    return [item.strip() for item in value.split(",") if item.strip()]


class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "change-me-now")
    SQLALCHEMY_DATABASE_URI = _normalize_database_url(os.getenv("DATABASE_URI"))
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JSON_SORT_KEYS = False

    MAX_CONTENT_LENGTH = int(os.getenv("MAX_CONTENT_LENGTH", 10 * 1024 * 1024))

    UPLOAD_FOLDER = str(BASE_DIR / "uploads")
    HEATMAP_FOLDER = str(BASE_DIR / "heatmaps")
    MODEL_FOLDER = str(BASE_DIR / "models_saved")
    MODEL_PATH = str(BASE_DIR / "models_saved" / "pneumoniaModel.h5")

    MODEL_GOOGLE_DRIVE_ID = os.getenv(
        "MODEL_GOOGLE_DRIVE_ID",
        "1cB7YkVU6CBMU6AS7rHxnyrVG6OaDgjTe",
    )
    MODEL_PREPROCESS_MODE = os.getenv("MODEL_PREPROCESS_MODE", "rescale_255")
    GRADCAM_LAYER_NAME = os.getenv("GRADCAM_LAYER_NAME", "relu")
    MODEL_VERSION = os.getenv("MODEL_VERSION", "DenseNet121-pneumonia-v1")

    JWT_EXPIRATION_HOURS = int(os.getenv("JWT_EXPIRATION_HOURS", 24))

    ADMIN_REGISTRATION_KEY = os.getenv("ADMIN_REGISTRATION_KEY", "team-admin-key")

    CORS_ORIGINS = _parse_origins(
        os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
    )

    ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg"}
    CLASS_NAMES = ["Normal", "Pneumonia"]

    DISCLAIMER_TEXT = (
        "This application is a screening aid only and is not a medical diagnosis tool. "
        "All outputs must be reviewed by a qualified clinician."
    )
