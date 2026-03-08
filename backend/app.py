from __future__ import annotations

import os

from dotenv import load_dotenv

# Load .env before Config is imported so os.getenv() picks up the env vars
load_dotenv()

from flask import Flask, jsonify
from flask_jwt_extended import JWTManager

from config import Config, get_cors_origins
from extensions import cors, db, jwt
from routes.admin import admin_bp
from routes.auth import auth_bp
from routes.forecast import forecast_bp
from routes.goals import goals_bp
from routes.summary import summary_bp
from routes.transactions import transactions_bp


def create_app() -> Flask:

  app = Flask(__name__)
  app.config.from_object(Config)

  # Extensions
  db.init_app(app)
  jwt.init_app(app)
  cors.init_app(
    app,
    resources={r"/api/*": {"origins": get_cors_origins()}},
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  )

  # Blueprints
  app.register_blueprint(auth_bp)
  app.register_blueprint(transactions_bp)
  app.register_blueprint(summary_bp)
  app.register_blueprint(forecast_bp)
  app.register_blueprint(goals_bp)
  app.register_blueprint(admin_bp)

  register_error_handlers(app)
  register_jwt_handlers(app)

  with app.app_context():
    import models  # noqa: F401

    db.create_all()

  return app


def register_jwt_handlers(app: Flask) -> None:
  from extensions import jwt as jwt_manager

  @jwt_manager.invalid_token_loader
  def invalid_token_callback(reason: str):
    return jsonify({"error": "Invalid token", "msg": reason}), 422

  @jwt_manager.unauthorized_loader
  def missing_token_callback(reason: str):
    return jsonify({"error": "Authorization required", "msg": reason}), 401

  @jwt_manager.expired_token_loader
  def expired_token_callback(jwt_header, jwt_payload):
    return jsonify({"error": "Token has expired", "msg": "Token expired"}), 401


def register_error_handlers(app: Flask) -> None:
  @app.errorhandler(400)
  def bad_request(err):  # type: ignore[override]
    return jsonify({"error": "Bad request", "details": str(err)}), 400

  @app.errorhandler(404)
  def not_found(err):  # type: ignore[override]
    return jsonify({"error": "Not found"}), 404

  @app.errorhandler(500)
  def internal_error(err):  # type: ignore[override]
    return jsonify({"error": "Internal server error"}), 500


app = create_app()

if __name__ == "__main__":
  port = int(os.getenv("PORT", "5000"))
  app.run(host="0.0.0.0", port=port, debug=True)

