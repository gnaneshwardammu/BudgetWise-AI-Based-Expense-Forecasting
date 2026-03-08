from __future__ import annotations

from datetime import date

import pandas as pd
from flask import Blueprint, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required

from models import Transaction, get_user_balance

summary_bp = Blueprint("summary", __name__, url_prefix="/api/summary")


def _transactions_df(user_id: int) -> pd.DataFrame:
  txs = Transaction.query.filter_by(user_id=user_id).all()
  rows = [
    {
      "date": t.date,
      "amount": float(t.amount),
      "type": t.type,
      "category": t.category,
    }
    for t in txs
  ]
  if not rows:
    return pd.DataFrame(columns=["date", "amount", "type", "category"])
  df = pd.DataFrame(rows)
  df["date"] = pd.to_datetime(df["date"])
  return df


@summary_bp.route("/monthly", methods=["GET"])
@jwt_required()
def monthly_summary():
  user_id = int(get_jwt_identity())
  df = _transactions_df(user_id)
  if df.empty:
    return jsonify({"monthly": [], "balance": 0.0}), 200

  df["month"] = df["date"].dt.to_period("M").dt.to_timestamp()
  grouped = df.groupby(["month", "type"])["amount"].sum().reset_index()

  monthly_totals = []
  for month, g in grouped.groupby("month"):
    income = float(g.loc[g["type"] == "income", "amount"].sum())
    expense = float(g.loc[g["type"] == "expense", "amount"].sum())
    monthly_totals.append(
      {
        "month": date(month.year, month.month, 1).isoformat(),
        "income": income,
        "expense": expense,
      }
    )

  balance = get_user_balance(user_id)
  return jsonify({"monthly": monthly_totals, "balance": balance}), 200


@summary_bp.route("/category", methods=["GET"])
@jwt_required()
def category_summary():
  user_id = int(get_jwt_identity())
  df = _transactions_df(user_id)
  if df.empty:
    return jsonify({"categories": []}), 200

  # Focus on expenses per category
  exp_df = df[df["type"] == "expense"]
  grouped = exp_df.groupby("category")["amount"].sum().reset_index()
  categories = [
    {"category": row["category"], "total": float(row["amount"])} for _, row in grouped.iterrows()
  ]
  return jsonify({"categories": categories}), 200


@summary_bp.route("/income-expense", methods=["GET"])
@jwt_required()
def income_expense_summary():
  user_id = int(get_jwt_identity())
  df = _transactions_df(user_id)
  if df.empty:
    return jsonify(
      {"income": 0.0, "expense": 0.0, "balance": 0.0, "savings_rate": 0.0}
    ), 200

  total_income = float(df.loc[df["type"] == "income", "amount"].sum())
  total_expense = float(df.loc[df["type"] == "expense", "amount"].sum())
  balance = float(total_income - total_expense)
  savings_rate = float((balance / total_income) * 100) if total_income > 0 else 0.0

  return (
    jsonify(
      {
        "income": total_income,
        "expense": total_expense,
        "balance": balance,
        "savings_rate": savings_rate,
      }
    ),
    200,
  )

