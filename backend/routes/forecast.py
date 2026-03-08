from __future__ import annotations

from flask import Blueprint, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required

from services.forecasting import build_expense_forecast

forecast_bp = Blueprint("forecast", __name__, url_prefix="/api")


@forecast_bp.route("/forecast", methods=["GET"])
@jwt_required()
def forecast():
  user_id = int(get_jwt_identity())
  result = build_expense_forecast(user_id)
  status = 200 if "forecast" in result else 400
  return jsonify(result), status

