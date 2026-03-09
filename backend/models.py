from datetime import datetime

from sqlalchemy import func
from werkzeug.security import check_password_hash, generate_password_hash

from extensions import db


class User(db.Model):
  __tablename__ = "users"

  id = db.Column(db.Integer, primary_key=True)
  email = db.Column(db.String(255), unique=True, nullable=False, index=True)
  password_hash = db.Column(db.String(255), nullable=False)
  is_admin = db.Column(db.Boolean, default=False, server_default="0", nullable=False)
  created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

  transactions = db.relationship("Transaction", backref="user", lazy=True, cascade="all, delete-orphan")
  goals = db.relationship("FinancialGoal", backref="user", lazy=True, cascade="all, delete-orphan")

  def set_password(self, password: str) -> None:
    self.password_hash = generate_password_hash(password)

  def check_password(self, password: str) -> bool:
    return check_password_hash(self.password_hash, password)


class Transaction(db.Model):
  __tablename__ = "transactions"

  id = db.Column(db.Integer, primary_key=True)
  user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
  date = db.Column(db.Date, nullable=False)
  amount = db.Column(db.Float, nullable=False)
  description = db.Column(db.String(512), nullable=False)
  type = db.Column(db.String(20), nullable=False)  # "income" or "expense"
  category = db.Column(db.String(100), nullable=False, default="Other")
  created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)


class FinancialGoal(db.Model):
  __tablename__ = "financial_goals"

  id = db.Column(db.Integer, primary_key=True)
  user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
  goal_name = db.Column(db.String(255), nullable=False)
  target_amount = db.Column(db.Float, nullable=False)
  target_date = db.Column(db.Date, nullable=False)
  current_progress = db.Column(db.Float, default=0.0, nullable=False)
  created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)


def get_user_balance(user_id: int) -> float:
  """Return current balance for a user based on transactions."""
  income = (
    db.session.query(func.coalesce(func.sum(Transaction.amount), 0.0))
    .filter_by(user_id=user_id, type="income")
    .scalar()
  )
  expense = (
    db.session.query(func.coalesce(func.sum(Transaction.amount), 0.0))
    .filter_by(user_id=user_id, type="expense")
    .scalar()
  )
  return float(income - expense)

