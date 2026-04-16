from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from extensions import db, jwt
from routes.auth import auth_bp
from routes.scan import scan_bp
from routes.admin import admin_bp
from routes.report import report_bp
import os


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)
    os.makedirs(app.config["HEATMAP_FOLDER"], exist_ok=True)
    os.makedirs(app.config["REPORT_FOLDER"], exist_ok=True)
    os.makedirs("instance", exist_ok=True)

    CORS(app)
    db.init_app(app)
    jwt.init_app(app)

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(scan_bp, url_prefix="/api/scan")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    app.register_blueprint(report_bp, url_prefix="/api/report")

    @app.route("/")
    def home():
        return jsonify({"message": "Pneumonia Detection API is running"})

    with app.app_context():
        db.create_all()

    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
