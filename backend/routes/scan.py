from flask import Blueprint, request, jsonify, send_from_directory, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from extensions import db
from models.scan import Scan
from services.inference import run_inference
from services.gradcam import generate_gradcam
import os
import uuid

scan_bp = Blueprint("scan", __name__)
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg"}


def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@scan_bp.route("/upload", methods=["POST"])
@jwt_required()
def upload_scan():
    identity = get_jwt_identity()

    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "Invalid file type"}), 400

    unique_name = f"{uuid.uuid4().hex}_{secure_filename(file.filename)}"
    file_path = os.path.join(current_app.config["UPLOAD_FOLDER"], unique_name)
    file.save(file_path)

    prediction, confidence = run_inference(file_path)

    heatmap_filename = f"heatmap_{unique_name}"
    heatmap_path = os.path.join(current_app.config["HEATMAP_FOLDER"], heatmap_filename)
    generate_gradcam(file_path, heatmap_path)

    scan = Scan(
        user_id=identity["id"],
        original_image_path=unique_name,
        heatmap_image_path=heatmap_filename,
        prediction=prediction,
        confidence=confidence,
    )
    db.session.add(scan)
    db.session.commit()

    return jsonify({
        "message": "Upload successful",
        "scan_id": scan.id,
        "prediction": prediction,
        "confidence": confidence,
        "image_url": f"/api/scan/image/{unique_name}",
        "heatmap_url": f"/api/scan/heatmap/{heatmap_filename}",
    })


@scan_bp.route("/history", methods=["GET"])
@jwt_required()
def history():
    identity = get_jwt_identity()
    scans = Scan.query.filter_by(user_id=identity["id"]).order_by(Scan.created_at.desc()).all()
    return jsonify([
        {
            "id": s.id,
            "prediction": s.prediction,
            "confidence": s.confidence,
            "created_at": s.created_at.isoformat(),
        }
        for s in scans
    ])


@scan_bp.route("/<int:scan_id>", methods=["GET"])
@jwt_required()
def scan_detail(scan_id):
    scan = Scan.query.get_or_404(scan_id)
    return jsonify({
        "id": scan.id,
        "prediction": scan.prediction,
        "confidence": scan.confidence,
        "created_at": scan.created_at.isoformat(),
        "original_image_path": scan.original_image_path,
        "heatmap_image_path": scan.heatmap_image_path,
    })


@scan_bp.route("/image/<path:filename>", methods=["GET"])
def serve_image(filename):
    return send_from_directory(current_app.config["UPLOAD_FOLDER"], filename)


@scan_bp.route("/heatmap/<path:filename>", methods=["GET"])
def serve_heatmap(filename):
    return send_from_directory(current_app.config["HEATMAP_FOLDER"], filename)
