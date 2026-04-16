import os

from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS

from config import Config
from extensions import bcrypt, db
from models.scan import Scan
from models.user import User
from routes.admin import admin_bp
from routes.auth import auth_bp
from routes.report import report_bp
from routes.scan import scan_bp
from services.inference import ensure_model_exists


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
    os.makedirs(app.config["HEATMAP_FOLDER"], exist_ok=True)
    os.makedirs(app.config["MODEL_FOLDER"], exist_ok=True)

    CORS(
        app,
        resources={r"/*": {"origins": app.config["CORS_ORIGINS"]}},
        supports_credentials=False,
    )

    db.init_app(app)
    bcrypt.init_app(app)

    app.register_blueprint(auth_bp)
    app.register_blueprint(scan_bp)
    app.register_blueprint(report_bp)
    app.register_blueprint(admin_bp)

    @app.route("/", methods=["GET"])
    def root():
        return jsonify(
            {
                "message": "AI-Enhanced Pneumonia Detection Backend is running",
                "status": "ok",
            }
        ), 200

    @app.route("/health", methods=["GET"])
    def health():
        model_ready = os.path.exists(app.config["MODEL_PATH"])
        return jsonify(
            {
                "status": "healthy",
                "model_ready": model_ready,
                "model_path": app.config["MODEL_PATH"],
            }
        ), 200

    @app.route("/uploads/<path:filename>", methods=["GET"])
    def serve_upload_file(filename):
        return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

    @app.route("/heatmaps/<path:filename>", methods=["GET"])
    def serve_heatmap_file(filename):
        return send_from_directory(app.config["HEATMAP_FOLDER"], filename)

    with app.app_context():
        db.create_all()
        try:
            ensure_model_exists()
        except Exception as exc:
            app.logger.warning(f"Model not ready at startup: {exc}")

    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
