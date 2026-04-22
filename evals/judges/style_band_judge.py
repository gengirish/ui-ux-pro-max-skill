"""Assert the chosen style (Style Category) is within the allowed band."""
from __future__ import annotations

from typing import Any, List, Optional, Tuple


def _norm(s: str) -> str:
    return (s or "").strip().casefold()


def judge_style_band(design: dict, allowed: List[str]) -> Tuple[bool, Optional[str]]:
    """
    Match design['style']['name'] case-insensitively against one of the band entries
    (also compared case-insensitively).
    """
    style = design.get("style") or {}
    actual = _norm(style.get("name", ""))
    for entry in allowed:
        if not entry or not str(entry).strip():
            continue
        if _norm(str(entry)) == actual:
            return True, None
    return (
        False,
        f"style: expected one of {allowed!r}, got {style.get('name', '')!r}",
    )
