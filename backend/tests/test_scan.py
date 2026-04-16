import io
import os

from extensions import db
from models.scan import Scan


def _mock_predict_image(_image_path):
    return {
        "predicted_index": 1,
        "predicted_label": "Pneumonia",
        "confidence": 0.9732,
        "normal_probability": 0.0268,
        "pneumonia_probability": 0.9732,
        "preprocess_mode": "rescale_255",
        "input_size": {"width": 224, "height": 224},
        "model_version": "test-model-v1",
    }


def _mock_generate_gradcam_assets(image_path, class_index=None):
    from flask import current_app

    heatmap_filename = "heatmap_test.png"
    overlay_filename = "overlay_test.png"

    heatmap_path = os.path.join(current_app.config["HEATMAP_FOLDER"], heatmap_filename)
    overlay_path = os.path.join(current_app.config["HEATMAP_FOLDER"], overlay_filename)

    with open(heatmap_path, "wb") as f:
        f.write(b"fake-heatmap")
    with open(overlay_path, "wb") as f:
        f.write(b"fake-overlay")

    return {
        "heatmap_filename": heatmap_filename,
        "overlay_filename": overlay_filename,
        "heatmap_path": heatmap_path,
        "overlay_path": overlay_path,
        "gradcam_layer": "relu",
        "preprocess_mode": "rescale_255",
    }


def test_upload_requires_auth(client, sample_image_file):
    response = client.post(
        "/scan/upload",
        data={"image": (sample_image_file, "xray.png"), "save_scan": "true"},
        content_type="multipart/form-data",
    )

    assert response.status_code == 401
    data = response.get_json()
    assert "Authorization token is missing" in data["error"]


def test_upload_rejects_invalid_extension(client, patient_headers):
    fake_text = io.BytesIO(b"not-an-image")
    response = client.post(
        "/scan/upload",
        headers=patient_headers,
        data={"image": (fake_text, "bad_file.txt"), "save_scan": "true"},
        content_type="multipart/form-data",
    )

    assert response.status_code == 400
    data = response.get_json()
    assert "Only PNG, JPG, and JPEG files are allowed" in data["error"]


def test_upload_success(client, patient_headers, sample_image_file, monkeypatch):
    monkeypatch.setattr("routes.scan.predict_image", _mock_predict_image)
    monkeypatch.setattr("routes.scan.generate_gradcam_assets", _mock_generate_gradcam_assets)

    response = client.post(
        "/scan/upload",
        headers=patient_headers,
        data={"image": (sample_image_file, "scan.png"), "save_scan": "true"},
        content_type="multipart/form-data",
    )

    assert response.status_code == 201
    data = response.get_json()

    assert data["message"] == "Scan processed successfully"
    assert data["saved_to_history"] is True
    assert data["prediction"]["predicted_label"] == "Pneumonia"
    assert data["prediction"]["confidence"] == 0.9732
    assert data["scan_id"] is not None
    assert "image_url" in data["files"]
    assert "heatmap_url" in data["files"]
    assert "overlay_url" in data["files"]


def test_history_returns_saved_scans(client, app, patient_user, patient_headers):
    with app.app_context():
        scan = Scan(
            user_id=patient_user.id,
            original_filename="example.png",
            stored_image_filename="stored_example.png",
            heatmap_filename="heatmap_example.png",
            overlay_filename="overlay_example.png",
            predicted_label="Normal",
            confidence=0.91,
            normal_probability=0.91,
            pneumonia_probability=0.09,
            model_version="test-model-v1",
            preprocess_mode="rescale_255",
            gradcam_layer="relu",
            saved_to_history=True,
            status="completed",
        )
        db.session.add(scan)
        db.session.commit()

    response = client.get("/scan/history", headers=patient_headers)

    assert response.status_code == 200
    data = response.get_json()
    assert data["count"] == 1
    assert data["scans"][0]["predicted_label"] == "Normal"


def test_get_scan_detail_owner_only(client, app, patient_user, patient_headers):
    with app.app_context():
        scan = Scan(
            user_id=patient_user.id,
            original_filename="owned.png",
            stored_image_filename="owned_stored.png",
            heatmap_filename="owned_heatmap.png",
            overlay_filename="owned_overlay.png",
            predicted_label="Pneumonia",
            confidence=0.88,
            normal_probability=0.12,
            pneumonia_probability=0.88,
            model_version="test-model-v1",
            preprocess_mode="rescale_255",
            gradcam_layer="relu",
            saved_to_history=True,
            status="completed",
        )
        db.session.add(scan)
        db.session.commit()
        scan_id = scan.id

    response = client.get(f"/scan/{scan_id}", headers=patient_headers)

    assert response.status_code == 200
    data = response.get_json()
    assert data["scan"]["id"] == scan_id
    assert data["scan"]["predicted_label"] == "Pneumonia"


def test_delete_scan_success(client, app, patient_user, patient_headers):
    with app.app_context():
        scan = Scan(
            user_id=patient_user.id,
            original_filename="delete.png",
            stored_image_filename="delete_stored.png",
            heatmap_filename="delete_heatmap.png",
            overlay_filename="delete_overlay.png",
            predicted_label="Normal",
            confidence=0.77,
            normal_probability=0.77,
            pneumonia_probability=0.23,
            model_version="test-model-v1",
            preprocess_mode="rescale_255",
            gradcam_layer="relu",
            saved_to_history=True,
            status="completed",
        )
        db.session.add(scan)
        db.session.commit()
        scan_id = scan.id

    response = client.delete(f"/scan/{scan_id}", headers=patient_headers)

    assert response.status_code == 200
    data = response.get_json()
    assert data["message"] == "Scan deleted successfully"

    with app.app_context():
        deleted = Scan.query.get(scan_id)
        assert deleted is None


def test_report_download(client, app, patient_user, patient_headers):
    upload_dir = app.config["UPLOAD_FOLDER"]
    heatmap_dir = app.config["HEATMAP_FOLDER"]

    original_name = "report_original.png"
    overlay_name = "report_overlay.png"

    with open(os.path.join(upload_dir, original_name), "wb") as f:
        f.write(b"fake-original-image")
    with open(os.path.join(heatmap_dir, overlay_name), "wb") as f:
        f.write(b"fake-overlay-image")

    with app.app_context():
        scan = Scan(
            user_id=patient_user.id,
            original_filename="report.png",
            stored_image_filename=original_name,
            heatmap_filename="report_heatmap.png",
            overlay_filename=overlay_name,
            predicted_label="Pneumonia",
            confidence=0.95,
            normal_probability=0.05,
            pneumonia_probability=0.95,
            model_version="test-model-v1",
            preprocess_mode="rescale_255",
            gradcam_layer="relu",
            saved_to_history=True,
            status="completed",
        )
        db.session.add(scan)
        db.session.commit()
        scan_id = scan.id

    response = client.get(f"/scan/{scan_id}/report", headers=patient_headers)

    assert response.status_code == 200
    assert response.mimetype == "application/pdf"
