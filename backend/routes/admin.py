from __future__ import annotations

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from extensions import db
from models import FinancialGoal, Transaction, User

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


def admin_required():
  """Return (None, None) if current user is admin, else (error_response, status_code)."""
  user_id = get_jwt_identity()
  user = User.query.get(int(user_id))
  if not user or not user.is_admin:
    return jsonify({"error": "Admin access required."}), 403
  return None, None


@admin_bp.route("/users", methods=["GET"])
@jwt_required()
def list_users():
  err, code = admin_required()
  if err:
    return err, code
  users = User.query.order_by(User.created_at.desc()).all()
  data = []
  for u in users:
    data.append(
      {
        "id": u.id,
        "email": u.email,
        "created_at": u.created_at.isoformat(),
        "transactions": Transaction.query.filter_by(user_id=u.id).count(),
        "goals": FinancialGoal.query.filter_by(user_id=u.id).count(),
      }
    )
  return jsonify(data), 200


@admin_bp.route("/stats", methods=["GET"])
@jwt_required()
def admin_stats():
  err, code = admin_required()
  if err:
    return err, code
  total_users = User.query.count()
  total_transactions = Transaction.query.count()
  total_goals = FinancialGoal.query.count()
  total_volume = db.session.query(db.func.coalesce(db.func.sum(Transaction.amount), 0.0)).scalar() or 0.0

  return (
    jsonify(
      {
        "total_users": total_users,
        "total_transactions": total_transactions,
        "total_goals": total_goals,
        "total_volume": float(total_volume),
      }
    ),
    200,
  )


@admin_bp.route("/categories", methods=["POST"])
@jwt_required()
def admin_add_category():
  err, code = admin_required()
  if err:
    return err, code
  data = request.get_json() or {}
  name = (data.get("name") or "").strip()
  if not name:
    return jsonify({"error": "Category name is required."}), 400

  # For now, just echo the created category
  return jsonify({"message": "Category accepted.", "name": name}), 201

