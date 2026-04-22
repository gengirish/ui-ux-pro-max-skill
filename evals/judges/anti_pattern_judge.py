"""
Assert banned phrases do not appear in color/effect text (case-insensitive).

Haystack: stringified color fields, color notes, key_effects, and style effects.
"""
from __future__ import annotations

from typing import Any, Dict, List, Optional, Tuple


def _colors_haystack(colors: Dict[str, Any]) -> str:
    parts = []
    for k, v in colors.items():
        if v is not None and str(v).strip():
            parts.append(str(v))
    return " ".join(parts)


def _build_haystack(design: dict) -> str:
    colors = design.get("colors") or {}
    style = design.get("style") or {}
    parts = [
        _colors_haystack(colors if isinstance(colors, dict) else {}),
        str(design.get("key_effects", "") or ""),
        str(style.get("effects", "") or ""),
    ]
    return " ".join(p for p in parts if p).casefold()


def judge_anti_patterns(
    design: dict, forbidden: List[str]
) -> Tuple[bool, Optional[str]]:
    if not forbidden:
        return True, None
    hay = _build_haystack(design)
    for phrase in forbidden:
        p = (phrase or "").strip()
        if not p:
            continue
        if p.casefold() in hay:
            return (
                False,
                f"anti_pattern: banned phrase {p!r} found in colors/effects text",
            )
    return True, None
