"""
Lightweight case schema (stdlib dataclasses only; no Pydantic).
"""
from __future__ import annotations

from dataclasses import dataclass, field
from typing import List, Optional


@dataclass
class GoldenExpected:
    """What eval judges assert against DesignSystemGenerator output."""

    ui_category_band: List[str]
    style_band: List[str]
    color_mood_includes_any: List[str]
    typography_mood_includes_any: List[str]
    forbidden_anti_patterns: List[str] = field(default_factory=list)


@dataclass
class GoldenCase:
    id: str
    prompt: str
    expected: GoldenExpected
    severity: str = "HIGH"
    skip: bool = False
    # Optional: used only for --update-snapshots file grouping / docs
    sector: Optional[str] = None
