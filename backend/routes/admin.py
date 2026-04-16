from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User
from models.scan import Scan

admin_bp = Blueprint("admin", __name__)


def is_admin(identity):
    return identity.get("role") == "admin"


@admin_bp.route("/users", methods=["GET"])
@jwt_required()
def list_users():
    identity = get_jwt_identity()
    if not is_admin(identity):
        return jsonify({"error": "Forbidden"}), 403

    users = User.query.all()
    return jsonify([
        {
            "id": u.id,
            "username": u.username,
            "email": u.email,
            "role": u.role,
        }
        for u in users
    ])


@admin_bp.route("/scans", methods=["GET"])
@jwt_required()
def list_scans():
    identity = get_jwt_identity()
    if not is_admin(identity):
        return jsonify({"error": "Forbidden"}), 403

    scans = Scan.query.order_by(Scan.created_at.desc()).all()
    return jsonify([
        {
            "id": s.id,
            "user_id": s.user_id,
            "prediction": s.prediction,
            "confidence": s.confidence,
            "created_at": s.created_at.isoformat(),
        }
        for s in scans
    ])
