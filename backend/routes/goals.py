from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any, Dict

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from extensions import db
from models import FinancialGoal
from services.forecasting import build_expense_forecast

goals_bp = Blueprint("goals", __name__, url_prefix="/api/goals")


def _parse_date(value: str | None):
  if not value:
    return None
  try:
    return datetime.strptime(value, "%Y-%m-%d").date()
  except ValueError:
    return None


def _project_completion(goal: FinancialGoal, forecast_data: Dict[str, Any]) -> str | None:
  """
  A simple projected completion based on average predicted daily expense reduction.

  This is intentionally lightweight and illustrative: we treat lower future
  expenses as freeing up cash toward the goal.
  """
  if "forecast" not in forecast_data:
    return None

  remaining = goal.target_amount - goal.current_progress
  if remaining <= 0:
    return datetime.utcnow().date().isoformat()

  forecast = forecast_data["forecast"]
  if not forecast:
    return None

  # Assume an arbitrary 20% of predicted expense can be redirected toward this goal.
  avg_daily_capacity = sum(max(0.0, f["yhat"] * 0.2) for f in forecast) / len(forecast)
  if avg_daily_capacity <= 0:
    return None

  days_needed = int(remaining / avg_daily_capacity)
  projected_date = datetime.utcnow().date() + timedelta(days=days_needed)
  return projected_date.isoformat()


@goals_bp.route("", methods=["POST"])
@jwt_required()
def create_goal():
  user_id = int(get_jwt_identity())
  data = request.get_json() or {}

  name = (data.get("goal_name") or "").strip()
  if not name:
    return jsonify({"error": "goal_name is required."}), 400

  try:
    target_amount = float(data.get("target_amount"))
  except (TypeError, ValueError):
    return jsonify({"error": "Invalid target_amount."}), 400

  target_date = _parse_date(data.get("target_date"))
  if not target_date:
    return jsonify({"error": "Invalid or missing target_date (expected YYYY-MM-DD)."}), 400

  current_progress = float(data.get("current_progress") or 0.0)

  goal = FinancialGoal(
    user_id=user_id,
    goal_name=name,
    target_amount=target_amount,
    target_date=target_date,
    current_progress=current_progress,
    created_at=datetime.utcnow(),
  )
  db.session.add(goal)
  db.session.commit()

  return jsonify(_serialize_goal(goal)), 201


@goals_bp.route("", methods=["GET"])
@jwt_required()
def list_goals():
  user_id = int(get_jwt_identity())
  goals = FinancialGoal.query.filter_by(user_id=user_id).order_by(FinancialGoal.created_at.desc()).all()
  # Use forecast-based projection for each goal
  forecast_data = build_expense_forecast(user_id)
  return jsonify([_serialize_goal(g, forecast_data) for g in goals]), 200


@goals_bp.route("/<int:goal_id>", methods=["PUT"])
@jwt_required()
def update_goal(goal_id: int):
  user_id = int(get_jwt_identity())
  goal = FinancialGoal.query.filter_by(id=goal_id, user_id=user_id).first()
  if not goal:
    return jsonify({"error": "Goal not found."}), 404

  data = request.get_json() or {}

  if "goal_name" in data:
    name = (data.get("goal_name") or "").strip()
    if not name:
      return jsonify({"error": "goal_name cannot be empty."}), 400
    goal.goal_name = name

  if "target_amount" in data:
    try:
      goal.target_amount = float(data.get("target_amount"))
    except (TypeError, ValueError):
      return jsonify({"error": "Invalid target_amount."}), 400

  if "target_date" in data:
    new_date = _parse_date(data.get("target_date"))
    if not new_date:
      return jsonify({"error": "Invalid target_date."}), 400
    goal.target_date = new_date

  if "current_progress" in data:
    try:
      goal.current_progress = float(data.get("current_progress"))
    except (TypeError, ValueError):
      return jsonify({"error": "Invalid current_progress."}), 400

  db.session.commit()
  forecast_data = build_expense_forecast(user_id)
  return jsonify(_serialize_goal(goal, forecast_data)), 200


@goals_bp.route("/<int:goal_id>", methods=["DELETE"])
@jwt_required()
def delete_goal(goal_id: int):
  user_id = int(get_jwt_identity())
  goal = FinancialGoal.query.filter_by(id=goal_id, user_id=user_id).first()
  if not goal:
    return jsonify({"error": "Goal not found."}), 404

  db.session.delete(goal)
  db.session.commit()
  return jsonify({"message": "Goal deleted."}), 200


def _serialize_goal(goal: FinancialGoal, forecast_data: Dict[str, Any] | None = None) -> dict:
  data = {
    "id": goal.id,
    "user_id": goal.user_id,
    "goal_name": goal.goal_name,
    "target_amount": goal.target_amount,
    "target_date": goal.target_date.isoformat(),
    "current_progress": goal.current_progress,
    "created_at": goal.created_at.isoformat(),
  }
  if forecast_data:
    projected = _project_completion(goal, forecast_data)
    data["projected_completion_date"] = projected
  return data

