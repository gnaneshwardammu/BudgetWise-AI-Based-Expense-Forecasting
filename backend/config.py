import os
from datetime import timedelta


class Config:
  """Base application configuration."""

  SECRET_KEY = os.getenv("SECRET_KEY", "change-me")
  JWT_SECRET_KEY = os.getenv("JWT_SECRET", "super-secret-jwt-key-change-in-prod")
  SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", "sqlite:///database.db")
  SQLALCHEMY_TRACK_MODIFICATIONS = False
  JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=12)

  CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")

  ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "")
  ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "")


def get_cors_origins() -> list[str] | str:
  return "*"

