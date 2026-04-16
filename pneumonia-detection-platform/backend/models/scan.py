from datetime import datetime
from extensions import db


class Scan(db.Model):
    __tablename__ = "scans"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    original_image_path = db.Column(db.String(255), nullable=False)
    heatmap_image_path = db.Column(db.String(255), nullable=True)
    prediction = db.Column(db.String(50), nullable=True)
    confidence = db.Column(db.Float, nullable=True)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
