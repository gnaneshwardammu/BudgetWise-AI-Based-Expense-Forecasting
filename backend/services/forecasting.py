from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Tuple

import pandas as pd
from prophet import Prophet

from extensions import db
from models import Transaction


def _prepare_expense_series(user_id: int) -> Tuple[pd.DataFrame, str | None]:
  """Prepare a daily expense time-series DataFrame for Prophet."""
  expenses: List[Transaction] = (
    Transaction.query.filter_by(user_id=user_id, type="expense").order_by(Transaction.date.asc()).all()
  )

  if len(expenses) < 5:
    return pd.DataFrame(), "Not enough expense data to build a forecast (need at least 5 records)."

  data = [{"ds": datetime.combine(tx.date, datetime.min.time()), "y": float(tx.amount)} for tx in expenses]
  df = pd.DataFrame(data)
  # Aggregate by day
  df = df.groupby("ds", as_index=False)["y"].sum()
  if df.shape[0] < 5:
    return pd.DataFrame(), "Not enough aggregated daily data to build a forecast."
  return df, None


def build_expense_forecast(user_id: int, periods: int = 30) -> Dict[str, Any]:
  """
  Train a Prophet model on a user's expenses and forecast the next N days.

  Returns a dictionary with 'forecast' list or an 'error' message.
  """
  df, error = _prepare_expense_series(user_id)
  if error:
    return {"error": error}

  model = Prophet(daily_seasonality=True, weekly_seasonality=True)
  model.fit(df)

  future = model.make_future_dataframe(periods=periods)
  forecast_df = model.predict(future)

  # Only return the forecast horizon (future dates)
  tail = forecast_df.tail(periods)
  results = []
  for _, row in tail.iterrows():
    results.append(
      {
        "ds": row["ds"].date().isoformat(),
        "yhat": float(row["yhat"]),
        "yhat_lower": float(row["yhat_lower"]),
        "yhat_upper": float(row["yhat_upper"]),
      }
    )

  return {"forecast": results}

