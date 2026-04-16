import os
import uuid

from flask import Blueprint, current_app, g, jsonify, request, url_for
from werkzeug.utils import secure_filename

from extensions import db
from models.scan import Scan
from services.gradcam import generate_gradcam_assets
from services.inference import predict_image
from utils.auth_helpers import login_required

scan_bp = Blueprint("scan", __name__, url_prefix="/scan")


def allowed_file(filename: str) -> bool:
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in current_app.config["ALLOWED_EXTENSIONS"]
    )


def scan_to_response(scan: Scan):
    data = scan.to_dict()
    data["image_url"] = url_for(
        "serve_upload_file",
        filename=scan.stored_image_filename,
        _external=True,
    )
    data["heatmap_url"] = (
        url_for("serve_heatmap_file", filename=scan.heatmap_filename, _external=True)
        if scan.heatmap_filename
        else None
    )
    data["overlay_url"] = (
        url_for("serve_heatmap_file", filename=scan.overlay_filename, _external=True)
        if scan.overlay_filename
        else None
    )
    return data


@scan_bp.route("/upload", methods=["POST"])
@login_required
def upload_scan():
    if "image" not in request.files:
        return jsonify({"error": "Image file is required"}), 400

    file = request.files["image"]

    if not file or file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "Only PNG, JPG, and JPEG files are allowed"}), 400

    save_scan = request.form.get("save_scan", "true").lower() == "true"
    safe_name = secure_filename(file.filename)
    unique_name = f"{uuid.uuid4().hex}_{safe_name}"
    upload_path = os.path.join(current_app.config["UPLOAD_FOLDER"], unique_name)

    try:
        os.makedirs(current_app.config["UPLOAD_FOLDER"], exist_ok=True)
        file.save(upload_path)

        prediction = predict_image(upload_path)
        gradcam = generate_gradcam_assets(
            upload_path,
            class_index=prediction["predicted_index"],
        )

        scan_record = None
        if save_scan:
            scan_record = Scan(
                user_id=g.current_user.id,
                original_filename=safe_name,
                stored_image_filename=unique_name,
                heatmap_filename=gradcam["heatmap_filename"],
                overlay_filename=gradcam["overlay_filename"],
                predicted_label=prediction["predicted_label"],
                confidence=prediction["confidence"],
                normal_probability=prediction["normal_probability"],
                pneumonia_probability=prediction["pneumonia_probability"],
                model_version=prediction["model_version"],
                preprocess_mode=prediction["preprocess_mode"],
                gradcam_layer=gradcam["gradcam_layer"],
                saved_to_history=True,
                status="completed",
            )
            db.session.add(scan_record)
            db.session.commit()

        response = {
            "message": "Scan processed successfully",
            "saved_to_history": save_scan,
            "scan_id": scan_record.id if scan_record else None,
            "prediction": {
                "predicted_label": prediction["predicted_label"],
                "confidence": prediction["confidence"],
                "normal_probability": prediction["normal_probability"],
                "pneumonia_probability": prediction["pneumonia_probability"],
                "model_version": prediction["model_version"],
                "preprocess_mode": prediction["preprocess_mode"],
                "gradcam_layer": gradcam["gradcam_layer"],
            },
            "files": {
                "image_url": url_for(
                    "serve_upload_file",
                    filename=unique_name,
                    _external=True,
                ),
                "heatmap_url": url_for(
                    "serve_heatmap_file",
                    filename=gradcam["heatmap_filename"],
                    _external=True,
                ),
                "overlay_url": url_for(
                    "serve_heatmap_file",
                    filename=gradcam["overlay_filename"],
                    _external=True,
                ),
            },
        }

        if scan_record:
            response["scan"] = scan_to_response(scan_record)

        return jsonify(response), 201

    except Exception as exc:
        if os.path.exists(upload_path):
            try:
                os.remove(upload_path)
            except Exception:
                pass

        return jsonify(
            {
                "error": "Scan processing failed",
                "details": str(exc),
            }
        ), 500


@scan_bp.route("/history", methods=["GET"])
@login_required
def get_history():
    scans = (
        Scan.query.filter_by(user_id=g.current_user.id, saved_to_history=True)
        .order_by(Scan.created_at.desc())
        .all()
    )

    return jsonify(
        {
            "count": len(scans),
            "scans": [scan_to_response(scan) for scan in scans],
        }
    ), 200


@scan_bp.route("/<int:scan_id>", methods=["GET"])
@login_required
def get_scan(scan_id):
    scan = Scan.query.get_or_404(scan_id)

    if g.current_user.role != "admin" and scan.user_id != g.current_user.id:
        return jsonify({"error": "Access denied"}), 403

    return jsonify({"scan": scan_to_response(scan)}), 200


@scan_bp.route("/<int:scan_id>", methods=["DELETE"])
@login_required
def delete_scan(scan_id):
    scan = Scan.query.get_or_404(scan_id)

    if g.current_user.role != "admin" and scan.user_id != g.current_user.id:
        return jsonify({"error": "Access denied"}), 403

    upload_path = os.path.join(current_app.config["UPLOAD_FOLDER"], scan.stored_image_filename)
    heatmap_path = (
        os.path.join(current_app.config["HEATMAP_FOLDER"], scan.heatmap_filename)
        if scan.heatmap_filename
        else None
    )
    overlay_path = (
        os.path.join(current_app.config["HEATMAP_FOLDER"], scan.overlay_filename)
        if scan.overlay_filename
        else None
    )

    db.session.delete(scan)
    db.session.commit()

    for path in [upload_path, heatmap_path, overlay_path]:
        if path and os.path.exists(path):
            try:
                os.remove(path)
            except Exception:
                pass

    return jsonify({"message": "Scan deleted successfully"}), 200               
