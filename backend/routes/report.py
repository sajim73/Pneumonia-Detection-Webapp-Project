from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required

report_bp = Blueprint("report", __name__)


@report_bp.route("/<int:scan_id>", methods=["GET"])
@jwt_required()
def generate_report(scan_id):
    return jsonify({"message": f"PDF report placeholder for scan {scan_id}"})
