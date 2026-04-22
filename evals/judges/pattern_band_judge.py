"""Assert matched product / UI category is within the allowed band."""
from __future__ import annotations

from typing import List, Optional, Tuple


def judge_ui_category_band(
    design: dict, allowed: List[str]
) -> Tuple[bool, Optional[str]]:
    """
    Return (True, None) if design['category'] is in allowed (exact string, stripped).
    Category comes from products.csv / BM25; bands list acceptable neighbors.
    """
    actual = (design.get("category") or "").strip()
    allowed_set = {a.strip() for a in allowed if a.strip()}
    if actual in allowed_set:
        return True, None
    return (
        False,
        f"ui_category: expected one of {sorted(allowed_set)!r}, got {actual!r}",
    )
