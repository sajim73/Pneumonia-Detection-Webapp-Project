import io
import os

from flask import Blueprint, current_app, g, jsonify, send_file
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas

from models.scan import Scan
from utils.auth_helpers import login_required

report_bp = Blueprint("report", __name__, url_prefix="/scan")


def _draw_wrapped_text(c, text, x, y, max_width, font_name="Helvetica", font_size=10, line_gap=14):
    words = text.split()
    current_line = ""

    for word in words:
        test_line = f"{current_line} {word}".strip()
        if stringWidth(test_line, font_name, font_size) <= max_width:
            current_line = test_line
        else:
            c.drawString(x, y, current_line)
            y -= line_gap
            current_line = word

    if current_line:
        c.drawString(x, y, current_line)
        y -= line_gap

    return y


@report_bp.route("/<int:scan_id>/report", methods=["GET"])
@login_required
def download_report(scan_id):
    scan = Scan.query.get_or_404(scan_id)

    if g.current_user.role != "admin" and scan.user_id != g.current_user.id:
        return jsonify({"error": "Access denied"}), 403

    image_path = os.path.join(current_app.config["UPLOAD_FOLDER"], scan.stored_image_filename)
    overlay_path = (
        os.path.join(current_app.config["HEATMAP_FOLDER"], scan.overlay_filename)
        if scan.overlay_filename
        else None
    )

    if not os.path.exists(image_path):
        return jsonify({"error": "Original scan image not found"}), 404

    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    margin = 40
    y = height - margin

    c.setTitle(f"Pneumonia Scan Report #{scan.id}")

    c.setFont("Helvetica-Bold", 18)
    c.drawString(margin, y, "AI-Enhanced Pneumonia Detection Report")
    y -= 28

    c.setStrokeColor(colors.grey)
    c.line(margin, y, width - margin, y)
    y -= 22

    c.setFont("Helvetica-Bold", 12)
    c.drawString(margin, y, "Scan Summary")
    y -= 18

    c.setFont("Helvetica", 10)
    details = [
        f"Scan ID: {scan.id}",
        f"Patient/User ID: {scan.user_id}",
        f"Original Filename: {scan.original_filename}",
        f"Prediction: {scan.predicted_label}",
        f"Confidence: {scan.confidence * 100:.2f}%",
        f"Normal Probability: {(scan.normal_probability or 0) * 100:.2f}%",
        f"Pneumonia Probability: {(scan.pneumonia_probability or 0) * 100:.2f}%",
        f"Model Version: {scan.model_version or 'N/A'}",
        f"Preprocess Mode: {scan.preprocess_mode or 'N/A'}",
        f"Grad-CAM Layer: {scan.gradcam_layer or 'N/A'}",
        f"Created At: {scan.created_at.isoformat() if scan.created_at else 'N/A'}",
    ]

    for line in details:
        c.drawString(margin, y, line)
        y -= 14

    y -= 8
    c.setFont("Helvetica-Bold", 12)
    c.drawString(margin, y, "Disclaimer")
    y -= 18

    c.setFont("Helvetica", 10)
    y = _draw_wrapped_text(
        c,
        current_app.config["DISCLAIMER_TEXT"],
        margin,
        y,
        width - (2 * margin),
    )
    y -= 8

    image_width = 230
    image_height = 180

    if y < 260:
        c.showPage()
        y = height - margin

    c.setFont("Helvetica-Bold", 12)
    c.drawString(margin, y, "Original X-ray")
    if overlay_path and os.path.exists(overlay_path):
        c.drawString(margin + image_width + 30, y, "Grad-CAM Overlay")
    y -= 16

    try:
        c.drawImage(
            ImageReader(image_path),
            margin,
            y - image_height,
            width=image_width,
            height=image_height,
            preserveAspectRatio=True,
            mask="auto",
        )
    except Exception:
        c.setFont("Helvetica", 10)
        c.drawString(margin, y - 20, "Could not render original image.")

    if overlay_path and os.path.exists(overlay_path):
        try:
            c.drawImage(
                ImageReader(overlay_path),
                margin + image_width + 30,
                y - image_height,
                width=image_width,
                height=image_height,
                preserveAspectRatio=True,
                mask="auto",
            )
        except Exception:
            c.setFont("Helvetica", 10)
            c.drawString(margin + image_width + 30, y - 20, "Could not render overlay image.")

    c.showPage()
    c.save()
    buffer.seek(0)

    return send_file(
        buffer,
        as_attachment=True,
        download_name=f"scan_report_{scan.id}.pdf",
        mimetype="application/pdf",
    )
