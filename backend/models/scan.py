from datetime import datetime, timezone
from extensions import db


class Scan(db.Model):
    __tablename__ = "scans"

    id = db.Column(db.Integer, primary_key=True)

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)

    original_filename = db.Column(db.String(255), nullable=False)
    stored_image_filename = db.Column(db.String(255), nullable=False)
    heatmap_filename = db.Column(db.String(255), nullable=True)
    overlay_filename = db.Column(db.String(255), nullable=True)

    predicted_label = db.Column(db.String(50), nullable=False)
    confidence = db.Column(db.Float, nullable=False)
    normal_probability = db.Column(db.Float, nullable=True)
    pneumonia_probability = db.Column(db.Float, nullable=True)

    model_version = db.Column(db.String(120), nullable=True)
    preprocess_mode = db.Column(db.String(50), nullable=True)
    gradcam_layer = db.Column(db.String(120), nullable=True)

    saved_to_history = db.Column(db.Boolean, nullable=False, default=True)
    status = db.Column(db.String(30), nullable=False, default="completed")

    created_at = db.Column(
        db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc), index=True
    )

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "original_filename": self.original_filename,
            "stored_image_filename": self.stored_image_filename,
            "heatmap_filename": self.heatmap_filename,
            "overlay_filename": self.overlay_filename,
            "predicted_label": self.predicted_label,
            "confidence": self.confidence,
            "normal_probability": self.normal_probability,
            "pneumonia_probability": self.pneumonia_probability,
            "model_version": self.model_version,
            "preprocess_mode": self.preprocess_mode,
            "gradcam_layer": self.gradcam_layer,
            "saved_to_history": self.saved_to_history,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
