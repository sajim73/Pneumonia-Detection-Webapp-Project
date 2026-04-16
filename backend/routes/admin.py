from flask import Blueprint, jsonify, request

from models.scan import Scan
from models.user import User
from utils.auth_helpers import admin_required

admin_bp = Blueprint("admin", __name__, url_prefix="/admin")


@admin_bp.route("/users", methods=["GET"])
@admin_required
def get_all_users():
    users = User.query.order_by(User.created_at.desc()).all()

    return jsonify(
        {
            "count": len(users),
            "users": [user.to_dict() for user in users],
        }
    ), 200


@admin_bp.route("/scans", methods=["GET"])
@admin_required
def get_all_scans():
    label = (request.args.get("label") or "").strip()
    user_id = request.args.get("user_id", type=int)

    query = Scan.query

    if label:
        query = query.filter(Scan.predicted_label == label)

    if user_id:
        query = query.filter(Scan.user_id == user_id)

    scans = query.order_by(Scan.created_at.desc()).all()

    scan_items = []
    for scan in scans:
        item = scan.to_dict()
        item["user"] = {
            "id": scan.user.id,
            "name": scan.user.name,
            "email": scan.user.email,
            "role": scan.user.role,
        } if scan.user else None
        scan_items.append(item)

    return jsonify(
        {
            "count": len(scan_items),
            "scans": scan_items,
        }
    ), 200


@admin_bp.route("/scans/<int:scan_id>", methods=["GET"])
@admin_required
def get_admin_scan_detail(scan_id):
    scan = Scan.query.get(scan_id)

    if not scan:
        return jsonify({"error": "Scan not found"}), 404

    item = scan.to_dict()
    item["user"] = {
        "id": scan.user.id,
        "name": scan.user.name,
        "email": scan.user.email,
        "role": scan.user.role,
    } if scan.user else None

    return jsonify({"scan": item}), 200
