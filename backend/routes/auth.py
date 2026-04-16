from flask import Blueprint, jsonify, request

from extensions import db
from models.user import User
from utils.auth_helpers import create_access_token, login_required

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}

    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    requested_role = (data.get("role") or "patient").strip().lower()
    admin_key = data.get("admin_key") or ""

    if not name or not email or not password:
        return jsonify({"error": "Name, email, and password are required"}), 400

    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email is already registered"}), 409

    role = "patient"
    from flask import current_app

    if requested_role == "admin":
        if admin_key != current_app.config["ADMIN_REGISTRATION_KEY"]:
            return jsonify({"error": "Invalid admin registration key"}), 403
        role = "admin"

    user = User(name=name, email=email, role=role)
    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    token = create_access_token(user)

    return jsonify(
        {
            "message": "Registration successful",
            "token": token,
            "user": user.to_dict(),
        }
    ), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}

    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid email or password"}), 401

    if not user.is_active:
        return jsonify({"error": "Account is inactive"}), 403

    token = create_access_token(user)

    return jsonify(
        {
            "message": "Login successful",
            "token": token,
            "user": user.to_dict(),
        }
    ), 200


@auth_bp.route("/me", methods=["GET"])
@login_required
def me():
    from flask import g
    return jsonify({"user": g.current_user.to_dict()}), 200
