import logging
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from backend.config import Config
from backend.db import get_db, is_database_mock
from backend.routes.auth import auth_bp
from backend.routes.doctors import doctors_bp
from backend.routes.appointments import appointments_bp
from backend.routes.records import records_bp
from backend.routes.prescriptions import prescriptions_bp
from backend.routes.ai import ai_bp
from backend.routes.admin import admin_bp
from backend.routes.notifications import notifications_bp
from backend.routes.medications import medications_bp
from backend.routes.pharmacy import pharmacy_bp

logging.basicConfig(
    level=logging.INFO,
    format="[%(asctime)s] %(levelname)s in %(module)s: %(message)s"
)
logger = logging.getLogger(__name__)

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=[Config.RATELIMIT_DEFAULT],
    storage_uri=Config.RATELIMIT_STORAGE_URI
)

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Enable Cross-Origin Resource Sharing
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

    # Initialize JWT
    jwt = JWTManager(app)

    @jwt.unauthorized_loader
    def unauthorized_callback(callback):
        return jsonify({"error": "Unauthorized", "message": "Missing authorization token."}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(callback):
        return jsonify({"error": "Unauthorized", "message": "Token is invalid or expired."}), 401

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({"error": "Unauthorized", "message": "Token has expired."}), 401

    # Initialize Limiter
    limiter.init_app(app)

    # Apply rate limiting to sensitive routes
    limiter.limit("20 per minute")(auth_bp)
    limiter.limit("30 per minute")(ai_bp)

    # Register Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(doctors_bp)
    app.register_blueprint(appointments_bp)
    app.register_blueprint(records_bp)
    app.register_blueprint(prescriptions_bp)
    app.register_blueprint(ai_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(notifications_bp)
    app.register_blueprint(medications_bp)
    app.register_blueprint(pharmacy_bp)

    # Auto-seed database if empty (ensures instant out-of-the-box readiness)
    with app.app_context():
        try:
            db = get_db()
            if db.users.count_documents({}) == 0:
                logger.info("Database is empty. Automatically executing development seed script...")
                from backend.seed import seed_database
                seed_database()
        except Exception as e:
            logger.warning("Auto-seed notice: %s", e)

    # Health check route
    @app.route("/api/health", methods=["GET"])
    def health_check():
        db = get_db()
        return jsonify({
            "status": "healthy",
            "database": "mock_in_memory" if is_database_mock() else "live_mongodb",
            "service": "Smart Healthcare Management System API"
        }), 200

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Not Found", "message": "The requested API route does not exist."}), 404

    @app.errorhandler(500)
    def internal_error(e):
        logger.error("Internal Server Error: %s", e)
        return jsonify({"error": "Internal Error", "message": "An unexpected error occurred."}), 500

    return app

app = create_app()

if __name__ == "__main__":
    logger.info("Starting Smart Healthcare Management API Server on port 5000...")
    # Initialize DB connection on startup
    get_db()
    app.run(host="0.0.0.0", port=5000, debug=True)
