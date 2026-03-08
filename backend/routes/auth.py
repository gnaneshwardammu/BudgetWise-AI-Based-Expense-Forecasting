from __future__ import annotations

import re
from datetime import datetime

from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required

from extensions import db
from models import User

auth_bp = Blueprint("auth", __name__, url_prefix="/api")

PASSWORD_REGEX = re.compile(
  r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$"
)
PASSWORD_ERROR_MESSAGE = (
  "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
)


@auth_bp.route("/register", methods=["POST"])
def register():
  data = request.get_json() or {}
  email = (data.get("email") or "").strip().lower()
  password = data.get("password") or ""

  if not email or not password:
    return jsonify({"error": "Email and password are required."}), 400

  if not PASSWORD_REGEX.match(password):
    return jsonify({"error": PASSWORD_ERROR_MESSAGE}), 400

  existing = User.query.filter_by(email=email).first()
  if existing:
    return jsonify({"error": "User with this email already exists."}), 400

  user = User(email=email, created_at=datetime.utcnow())
  user.set_password(password)
  db.session.add(user)
  db.session.commit()

  return jsonify({"message": "Registration successful."}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
  data = request.get_json() or {}
  email = (data.get("email") or "").strip().lower()
  password = data.get("password") or ""

  if not email or not password:
    return jsonify({"error": "Email and password are required."}), 400

  user = User.query.filter_by(email=email).first()
  if not user or not user.check_password(password):
    return jsonify({"error": "Invalid email or password."}), 401

  access_token = create_access_token(identity=str(user.id))
  return jsonify({"access_token": access_token, "email": user.email}), 200


@auth_bp.route("/profile", methods=["GET"])
@jwt_required()
def profile():
  user_id = get_jwt_identity()
  user = User.query.get(int(user_id))
  if not user:
    return jsonify({"error": "User not found."}), 404

  return (
    jsonify(
      {
        "id": user.id,
        "email": user.email,
        "created_at": user.created_at.isoformat(),
      }
    ),
    200,
  )

