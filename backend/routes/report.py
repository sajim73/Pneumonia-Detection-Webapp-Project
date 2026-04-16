import os
from io import BytesIO

from flask import Blueprint, current_app, g, jsonify, request, send_file
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas

from models.scan import Scan
from utils.auth_helpers import login_required

report_bp = Blueprint("report", __name__, url_prefix="/scan")


def can_access_scan(user, scan: Scan) -> bool:
    return user.role == "admin" or scan.user_id == user.id


def _draw_header(pdf, width, height, title):
    pdf.setFillColor(colors.HexColor("#0f766e"))
    pdf.rect(0, height - 70, width, 70, fill=1, stroke=0)

    pdf.setFillColor(colors.white)
    pdf.setFont("Helvetica-Bold", 20)
    pdf.drawString(40, height - 42, title)


def _draw_wrapped_text(pdf, text, x, y, max_width=520, line_height=14, font_name="Helvetica", font_size=10):
    pdf.setFont(font_name, font_size)
    words = text.split()
    line = ""

    for word in words:
        test = f"{line} {word}".strip()
        if pdf.stringWidth(test, font_name, font_size) <= max_width:
            line = test
        else:
            pdf.drawString(x, y, line)
            y -= line_height
            line = word

    if line:
        pdf.drawString(x, y, line)
        y -= line_height

    return y


@report_bp.route("/<int:scan_id>/report", methods=["GET"])
@login_required
def download_scan_report(scan_id):
    scan = Scan.query.get(scan_id)

    if not scan:
        return jsonify({"error": "Scan not found"}), 404

    if not can_access_scan(g.current_user, scan):
        return jsonify({"error": "You do not have access to this report"}), 403

    original_path = os.path.join(
        current_app.config["UPLOAD_FOLDER"], scan.stored_image_filename
    )
    overlay_path = (
        os.path.join(current_app.config["HEATMAP_FOLDER"], scan.overlay_filename)
        if scan.overlay_filename
        else None
    )

    if not os.path.exists(original_path):
        return jsonify({"error": "Original scan image file is missing"}), 404

    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    _draw_header(pdf, width, height, "Pneumonia Screening Report")

    pdf.setFillColor(colors.black)
    pdf.setFont("Helvetica", 11)
    y = height - 100
    pdf.drawString(40, y, f"Scan ID: {scan.id}")
    y -= 18
    pdf.drawString(40, y, f"User ID: {scan.user_id}")
    y -= 18
    pdf.drawString(40, y, f"Original File: {scan.original_filename}")
    y -= 18
    pdf.drawString(40, y, f"Prediction: {scan.predicted_label}")
    y -= 18
    pdf.drawString(40, y, f"Confidence: {scan.confidence * 100:.2f}%")
    y -= 18
    pdf.drawString(40, y, f"Normal Probability: {(scan.normal_probability or 0) * 100:.2f}%")
    y -= 18
    pdf.drawString(40, y, f"Pneumonia Probability: {(scan.pneumonia_probability or 0) * 100:.2f}%")
    y -= 18
    pdf.drawString(40, y, f"Model Version: {scan.model_version or 'N/A'}")
    y -= 18
    pdf.drawString(40, y, f"Preprocess Mode: {scan.preprocess_mode or 'N/A'}")
    y -= 18
    pdf.drawString(40, y, f"Grad-CAM Layer: {scan.gradcam_layer or 'N/A'}")
    y -= 18
    pdf.drawString(40, y, f"Created At: {scan.created_at.isoformat() if scan.created_at else 'N/A'}")
    y -= 30

    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(40, y, "Clinical Use Notice")
    y -= 16

    pdf.setFont("Helvetica", 10)
    y = _draw_wrapped_text(
        pdf,
        current_app.config["DISCLAIMER_TEXT"],
        40,
        y,
        max_width=520,
        line_height=13,
        font_name="Helvetica",
        font_size=10,
    )

    y -= 10

    try:
        original_img = ImageReader(original_path)
        pdf.setFont("Helvetica-Bold", 12)
        pdf.drawString(40, y, "Uploaded X-ray")
        pdf.drawImage(
            original_img,
            40,
            max(y - 210, 80),
            width=220,
            height=180,
            preserveAspectRatio=True,
            mask="auto",
        )
    except Exception:
        pdf.setFont("Helvetica", 10)
        pdf.drawString(40, y, "Could not render original scan image.")
    y_image_base = max(y - 210, 80)

    if overlay_path and os.path.exists(overlay_path):
        try:
            overlay_img = ImageReader(overlay_path)
            pdf.setFont("Helvetica-Bold", 12)
            pdf.drawString(300, y, "Grad-CAM Overlay")
            pdf.drawImage(
                overlay_img,
                300,
                y_image_base,
                width=220,
                height=180,
                preserveAspectRatio=True,
                mask="auto",
            )
        except Exception:
            pdf.setFont("Helvetica", 10)
            pdf.drawString(300, y, "Could not render Grad-CAM overlay.")

    pdf.showPage()
    pdf.save()
    buffer.seek(0)

    as_attachment = request.args.get("download", "0") == "1"
    filename = f"scan_report_{scan.id}.pdf"

    return send_file(
        buffer,
        mimetype="application/pdf",
        as_attachment=as_attachment,
        download_name=filename,
    )
