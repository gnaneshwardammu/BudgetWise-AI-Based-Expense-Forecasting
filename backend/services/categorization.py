from __future__ import annotations

import re
from typing import Dict, Iterable

import nltk

_CATEGORY_KEYWORDS: Dict[str, Iterable[str]] = {
  "Food": ["swiggy", "restaurant", "food", "zomato", "dining", "snack", "cafe"],
  "Transport": ["uber", "ola", "bus", "fuel", "petrol", "diesel", "metro", "cab", "train"],
  "Housing": ["rent", "mortgage", "emi"],
  "Utilities": ["electricity", "water", "internet", "wifi", "gas", "broadband"],
  "Entertainment": ["netflix", "spotify", "movie", "cinema", "game", "concert"],
}


def _normalize(text: str) -> str:
  text = text.lower()
  text = re.sub(r"[^a-z0-9\s]", " ", text)
  text = re.sub(r"\s+", " ", text).strip()
  return text


def categorize_description(description: str) -> str:
  """
  Categorize a transaction description using simple keyword rules.

  Uses a lightweight NLTK-based tokenization to demonstrate integration,
  but avoids requiring large corpora downloads.
  """
  normalized = _normalize(description)
  if not normalized:
    return "Other"

  # Simple tokenization
  try:
    tokens = nltk.word_tokenize(normalized)
  except LookupError:
    # Fallback if punkt is not available
    tokens = normalized.split()

  token_set = set(tokens)

  for category, keywords in _CATEGORY_KEYWORDS.items():
    for kw in keywords:
      if kw in token_set or kw in normalized:
        return category

  return "Other"

