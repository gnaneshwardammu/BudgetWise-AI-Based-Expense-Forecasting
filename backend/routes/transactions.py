from __future__ import annotations

from datetime import date, datetime

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from extensions import db
from models import Transaction
from services.categorization import categorize_description

transactions_bp = Blueprint("transactions", __name__, url_prefix="/api/transactions")


def _parse_date(value: str | None) -> date | None:
  if not value:
    return None
  try:
    return datetime.strptime(value, "%Y-%m-%d").date()
  except ValueError:
    return None


@transactions_bp.route("", methods=["POST"])
@jwt_required()
def create_transaction():
  user_id = int(get_jwt_identity())
  data = request.get_json() or {}

  raw_date = data.get("date")
  tx_date = _parse_date(raw_date)
  if not tx_date:
    return jsonify({"error": "Invalid or missing date (expected YYYY-MM-DD)."}), 400

  try:
    amount = float(data.get("amount"))
  except (TypeError, ValueError):
    return jsonify({"error": "Invalid amount."}), 400

  description = (data.get("description") or "").strip()
  if not description:
    return jsonify({"error": "Description is required."}), 400

  tx_type = (data.get("type") or "").lower()
  if tx_type not in {"income", "expense"}:
    return jsonify({"error": "Type must be 'income' or 'expense'."}), 400

  category = data.get("category") or categorize_description(description)

  tx = Transaction(
    user_id=user_id,
    date=tx_date,
    amount=amount,
    description=description,
    type=tx_type,
    category=category,
    created_at=datetime.utcnow(),
  )
  db.session.add(tx)
  db.session.commit()

  return jsonify(_serialize_transaction(tx)), 201


@transactions_bp.route("", methods=["GET"])
@jwt_required()
def list_transactions():
  user_id = int(get_jwt_identity())
  txs = (
    Transaction.query.filter_by(user_id=user_id)
    .order_by(Transaction.date.desc(), Transaction.created_at.desc())
    .all()
  )
  return jsonify([_serialize_transaction(t) for t in txs]), 200


@transactions_bp.route("/<int:tx_id>", methods=["PUT"])
@jwt_required()
def update_transaction(tx_id: int):
  user_id = int(get_jwt_identity())
  tx = Transaction.query.filter_by(id=tx_id, user_id=user_id).first()
  if not tx:
    return jsonify({"error": "Transaction not found."}), 404

  data = request.get_json() or {}

  if "date" in data:
    new_date = _parse_date(data.get("date"))
    if not new_date:
      return jsonify({"error": "Invalid date."}), 400
    tx.date = new_date

  if "amount" in data:
    try:
      tx.amount = float(data.get("amount"))
    except (TypeError, ValueError):
      return jsonify({"error": "Invalid amount."}), 400

  if "description" in data:
    desc = (data.get("description") or "").strip()
    if not desc:
      return jsonify({"error": "Description cannot be empty."}), 400
    tx.description = desc

  if "type" in data:
    new_type = (data.get("type") or "").lower()
    if new_type not in {"income", "expense"}:
      return jsonify({"error": "Type must be 'income' or 'expense'."}), 400
    tx.type = new_type

  if "category" in data:
    tx.category = data.get("category") or categorize_description(tx.description)

  db.session.commit()
  return jsonify(_serialize_transaction(tx)), 200


@transactions_bp.route("/<int:tx_id>", methods=["DELETE"])
@jwt_required()
def delete_transaction(tx_id: int):
  user_id = int(get_jwt_identity())
  tx = Transaction.query.filter_by(id=tx_id, user_id=user_id).first()
  if not tx:
    return jsonify({"error": "Transaction not found."}), 404

  db.session.delete(tx)
  db.session.commit()
  return jsonify({"message": "Transaction deleted."}), 200


def _serialize_transaction(tx: Transaction) -> dict:
  return {
    "id": tx.id,
    "user_id": tx.user_id,
    "date": tx.date.isoformat(),
    "amount": tx.amount,
    "description": tx.description,
    "type": tx.type,
    "category": tx.category,
    "created_at": tx.created_at.isoformat(),
  }

