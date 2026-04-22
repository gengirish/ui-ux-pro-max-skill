#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Design token generators: CSS variables, Tailwind extend snippet, W3C DTCG JSON, summary dict.
Spelling of keys in STYLE_TOKEN_DEFAULTS must match the `Style Category` column in data/styles.csv.
"""
from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Tuple

# Keys match src/ui-ux-pro-max/data/styles.csv "Style Category" values exactly.
STYLE_TOKEN_DEFAULTS: dict[str, dict[str, str]] = {
    "Brutalism": {
        "radius_sm": "0px",
        "radius_md": "0px",
        "radius_lg": "0px",
        "shadow_sm": "none",
        "shadow_md": "none",
        "transition_fast": "0s",
        "transition_base": "0s",
    },
    "Soft UI Evolution": {
        "radius_sm": "10px",
        "radius_md": "14px",
        "radius_lg": "18px",
        "shadow_sm": "0 2px 6px rgba(0,0,0,0.04)",
        "shadow_md": "0 4px 12px rgba(0,0,0,0.06)",
        "transition_fast": "150ms",
        "transition_base": "250ms",
    },
    "Neumorphism": {
        "radius_sm": "10px",
        "radius_md": "16px",
        "radius_lg": "20px",
        "shadow_sm": "-3px -3px 8px rgba(255,255,255,0.6), 3px 3px 8px rgba(0,0,0,0.08)",
        "shadow_md": "-5px -5px 15px rgba(255,255,255,0.7), 5px 5px 15px rgba(0,0,0,0.1)",
        "transition_fast": "150ms",
        "transition_base": "150ms",
    },
    "Glassmorphism": {
        "radius_sm": "8px",
        "radius_md": "12px",
        "radius_lg": "16px",
        "shadow_sm": "0 4px 16px rgba(31,38,135,0.1)",
        "shadow_md": "0 8px 32px rgba(31,38,135,0.15)",
        "transition_fast": "150ms",
        "transition_base": "250ms",
    },
    "Minimalism & Swiss Style": {
        "radius_sm": "0px",
        "radius_md": "0px",
        "radius_lg": "0px",
        "shadow_sm": "none",
        "shadow_md": "none",
        "transition_fast": "200ms",
        "transition_base": "200ms",
    },
    "Flat Design": {
        "radius_sm": "2px",
        "radius_md": "4px",
        "radius_lg": "6px",
        "shadow_sm": "none",
        "shadow_md": "none",
        "transition_fast": "150ms",
        "transition_base": "200ms",
    },
    "Dark Mode (OLED)": {
        "radius_sm": "6px",
        "radius_md": "8px",
        "radius_lg": "10px",
        "shadow_sm": "0 0 10px rgba(57,255,20,0.15)",
        "shadow_md": "0 0 20px rgba(0,128,255,0.2)",
        "transition_fast": "150ms",
        "transition_base": "200ms",
    },
    "Claymorphism": {
        "radius_sm": "16px",
        "radius_md": "20px",
        "radius_lg": "24px",
        "shadow_sm": "inset -1px -1px 4px rgba(0,0,0,0.06), 2px 2px 6px rgba(0,0,0,0.08)",
        "shadow_md": "inset -2px -2px 8px rgba(0,0,0,0.08), 4px 4px 8px rgba(0,0,0,0.1)",
        "transition_fast": "150ms",
        "transition_base": "200ms",
    },
    "Neubrutalism": {
        "radius_sm": "0px",
        "radius_md": "0px",
        "radius_lg": "0px",
        "shadow_sm": "3px 3px 0 #000",
        "shadow_md": "5px 5px 0 #000",
        "transition_fast": "0s",
        "transition_base": "0s",
    },
    "Bento Box Grid": {
        "radius_sm": "16px",
        "radius_md": "20px",
        "radius_lg": "24px",
        "shadow_sm": "0 1px 3px rgba(0,0,0,0.04)",
        "shadow_md": "0 4px 6px rgba(0,0,0,0.05)",
        "transition_fast": "150ms",
        "transition_base": "250ms",
    },
    "AI-Native UI": {
        "radius_sm": "8px",
        "radius_md": "10px",
        "radius_lg": "12px",
        "shadow_sm": "0 1px 2px rgba(0,0,0,0.05)",
        "shadow_md": "0 4px 6px rgba(0,0,0,0.08)",
        "transition_fast": "150ms",
        "transition_base": "250ms",
    },
    "Vibrant & Block-based": {
        "radius_sm": "8px",
        "radius_md": "10px",
        "radius_lg": "12px",
        "shadow_sm": "0 2px 4px rgba(0,0,0,0.12)",
        "shadow_md": "0 4px 12px rgba(0,0,0,0.15)",
        "transition_fast": "150ms",
        "transition_base": "200ms",
    },
    "Aurora UI": {
        "radius_sm": "10px",
        "radius_md": "12px",
        "radius_lg": "16px",
        "shadow_sm": "0 4px 20px rgba(0,0,0,0.1)",
        "shadow_md": "0 8px 32px rgba(0,0,0,0.12)",
        "transition_fast": "150ms",
        "transition_base": "300ms",
    },
    "Dimensional Layering": {
        "radius_sm": "6px",
        "radius_md": "8px",
        "radius_lg": "12px",
        "shadow_sm": "0 1px 3px rgba(0,0,0,0.1)",
        "shadow_md": "0 4px 6px rgba(0,0,0,0.1), 0 10px 20px rgba(0,0,0,0.08)",
        "transition_fast": "150ms",
        "transition_base": "250ms",
    },
    "Exaggerated Minimalism": {
        "radius_sm": "0px",
        "radius_md": "0px",
        "radius_lg": "0px",
        "shadow_sm": "none",
        "shadow_md": "none",
        "transition_fast": "200ms",
        "transition_base": "300ms",
    },
    "3D & Hyperrealism": {
        "radius_sm": "8px",
        "radius_md": "10px",
        "radius_lg": "12px",
        "shadow_sm": "0 4px 6px rgba(0,0,0,0.2)",
        "shadow_md": "0 12px 24px rgba(0,0,0,0.25), 0 2px 4px rgba(0,0,0,0.15)",
        "transition_fast": "150ms",
        "transition_base": "300ms",
    },
    "Executive Dashboard": {
        "radius_sm": "4px",
        "radius_md": "6px",
        "radius_lg": "8px",
        "shadow_sm": "0 1px 2px rgba(0,0,0,0.06)",
        "shadow_md": "0 4px 6px rgba(0,0,0,0.1)",
        "transition_fast": "150ms",
        "transition_base": "200ms",
    },
    "Zero Interface": {
        "radius_sm": "8px",
        "radius_md": "8px",
        "radius_lg": "8px",
        "shadow_sm": "none",
        "shadow_md": "0 1px 2px rgba(0,0,0,0.04)",
        "transition_fast": "200ms",
        "transition_base": "300ms",
    },
    "Organic Biophilic": {
        "radius_sm": "16px",
        "radius_md": "20px",
        "radius_lg": "24px",
        "shadow_sm": "0 4px 12px rgba(0,0,0,0.08)",
        "shadow_md": "0 8px 32px rgba(0,0,0,0.08)",
        "transition_fast": "150ms",
        "transition_base": "250ms",
    },
    "Cyberpunk UI": {
        "radius_sm": "0px",
        "radius_md": "2px",
        "radius_lg": "4px",
        "shadow_sm": "0 0 8px rgba(0,255,0,0.3)",
        "shadow_md": "0 0 16px rgba(255,0,255,0.4)",
        "transition_fast": "0s",
        "transition_base": "150ms",
    },
    "Vaporwave": {
        "radius_sm": "4px",
        "radius_md": "6px",
        "radius_lg": "8px",
        "shadow_sm": "0 0 12px rgba(255,113,206,0.3)",
        "shadow_md": "0 0 20px rgba(1,205,254,0.25)",
        "transition_fast": "150ms",
        "transition_base": "250ms",
    },
}

DEFAULT_TOKENS: dict[str, str] = {
    "radius_sm": "6px",
    "radius_md": "8px",
    "radius_lg": "12px",
    "shadow_sm": "0 1px 2px rgba(0,0,0,0.05)",
    "shadow_md": "0 1px 3px rgba(0,0,0,0.1)",
    "transition_fast": "150ms",
    "transition_base": "250ms",
}

_CHECKLIST: list[str] = [
    "No emojis as icons (use SVG: Heroicons/Lucide)",
    "cursor-pointer on all clickable elements",
    "Hover states with smooth transitions (150-300ms)",
    "Light mode: text contrast 4.5:1 minimum",
    "Focus states visible for keyboard nav",
    "prefers-reduced-motion respected",
    "Responsive: 375px, 768px, 1024px, 1440px",
]

_SPACE_PX: Tuple[Tuple[str, int], ...] = (
    ("1", 4),
    ("2", 8),
    ("3", 12),
    ("4", 16),
    ("5", 24),
    ("6", 32),
    ("7", 48),
    ("8", 64),
)


def _style_tokens(design_system: dict) -> dict[str, str]:
    name = (design_system.get("style") or {}).get("name", "") or ""
    row = STYLE_TOKEN_DEFAULTS.get(name)
    if not row:
        return {**DEFAULT_TOKENS}
    return {**DEFAULT_TOKENS, **row}


def _color(
    design_system: dict, key: str, fallback: str
) -> str:
    c = design_system.get("colors") or {}
    v = c.get(key)
    if v:
        return str(v)
    if key == "text":
        return str(c.get("foreground") or c.get("text") or fallback)
    if key == "cta":
        return str(c.get("accent") or c.get("cta") or fallback)
    return str(fallback)


def to_css_variables(design_system: dict) -> str:
    t = _style_tokens(design_system)
    c = design_system.get("colors") or {}
    typo = design_system.get("typography") or {}

    primary = _color(design_system, "primary", "#2563EB")
    secondary = _color(design_system, "secondary", "#3B82F6")
    cta = _color(design_system, "cta", "#F97316")
    background = _color(design_system, "background", "#F8FAFC")
    text = _color(design_system, "text", "#1E293B")
    border = c.get("border") or "rgba(0,0,0,0.1)"
    muted = c.get("muted") or "rgba(0,0,0,0.5)"

    def _font(val: str, fallback: str) -> str:
        s = (val or "Inter").strip()
        if not s:
            s = "Inter"
        return s if "," in s else f'"{s}", {fallback}'

    h = _font(str(typo.get("heading") or "Inter"), "serif, ui-serif, Georgia, serif")
    b = _font(str(typo.get("body") or "Inter"), "ui-sans-serif, system-ui, sans-serif")

    lines: list[str] = [":root {"]
    lines.append("  /* ——— Colors ——— */")
    lines.append(f"  --color-primary: {primary};")
    lines.append(f"  --color-secondary: {secondary};")
    lines.append(f"  --color-cta: {cta};")
    lines.append(f"  --color-background: {background};")
    lines.append(f"  --color-text: {text};")
    lines.append(f"  --color-border: {border};")
    lines.append(f"  --color-muted: {muted};")
    lines.append("")
    lines.append("  /* ——— Typography ——— */")
    lines.append(f"  --font-heading: {h};")
    lines.append(f"  --font-body: {b};")
    lines.append("")
    lines.append("  /* ——— Radius ——— */")
    lines.append(f"  --radius-sm: {t['radius_sm']};")
    lines.append(f"  --radius-md: {t['radius_md']};")
    lines.append(f"  --radius-lg: {t['radius_lg']};")
    lines.append("")
    lines.append("  /* ——— Shadow ——— */")
    lines.append(f"  --shadow-sm: {t['shadow_sm']};")
    lines.append(f"  --shadow-md: {t['shadow_md']};")
    lines.append("")
    lines.append("  /* ——— Motion ——— */")
    lines.append(f"  --transition-fast: {t['transition_fast']};")
    lines.append(f"  --transition-base: {t['transition_base']};")
    lines.append("")
    lines.append("  /* ——— Spacing (rem) ——— */")
    for num, px in _SPACE_PX:
        rem = px / 16.0
        lines.append(f"  --space-{num}: {px}px; /* {rem}rem */")
    lines.append("}")
    return "\n".join(lines) + "\n"


def to_tailwind_config(design_system: dict) -> str:
    t = _style_tokens(design_system)
    project = design_system.get("project_name") or "Unnamed"
    st = (design_system.get("style") or {}).get("name", "")
    when = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S") + "Z"
    c = design_system.get("colors") or {}
    primary = _color(design_system, "primary", "#2563EB")
    secondary = _color(design_system, "secondary", "#3B82F6")
    cta = _color(design_system, "cta", "#F97316")
    background = _color(design_system, "background", "#F8FAFC")
    text = _color(design_system, "text", "#1E293B")
    border = c.get("border") or "rgba(0,0,0,0.1)"
    muted = c.get("muted") or "rgba(0,0,0,0.5)"
    heading = (design_system.get("typography") or {}).get("heading", "Inter")
    body = (design_system.get("typography") or {}).get("body", "Inter")

    header = f"""// Generated by UI UX Pro Max for project: {project}
// Style: {st}  |  Generated: {when}
// Merge into your tailwind.config.js theme.extend
"""
    jdoc = "/** @type {import('tailwindcss').Config} */\n"
    body_js = f"""{jdoc}{header}module.exports = {{
  theme: {{
    extend: {{
      colors: {{
        primary: "{primary}",
        secondary: "{secondary}",
        cta: "{cta}",
        background: "{background}",
        text: "{text}",
        border: "{border}",
        muted: "{muted}",
      }},
      fontFamily: {{
        heading: [ "{str(heading).replace(chr(34), chr(39))}", "ui-serif", "Georgia", "serif" ],
        body: [ "{str(body).replace(chr(34), chr(39))}", "ui-sans-serif", "system-ui", "sans-serif" ],
      }},
      borderRadius: {{
        sm: "{t['radius_sm']}",
        DEFAULT: "{t['radius_md']}",
        md: "{t['radius_md']}",
        lg: "{t['radius_lg']}",
      }},
      boxShadow: {{
        sm: "{_escape_js_string(t['shadow_sm'])}",
        md: "{_escape_js_string(t['shadow_md'])}",
      }},
      transitionDuration: {{
        fast: "{t['transition_fast']}",
        DEFAULT: "{t['transition_base']}",
      }},
    }},
  }},
}};
"""
    return body_js


def _escape_js_string(s: str) -> str:
    return s.replace("\\", "\\\\").replace('"', '\\"')


def to_w3c_tokens(design_system: dict) -> dict[str, Any]:
    t = _style_tokens(design_system)
    c = design_system.get("colors") or {}
    primary = _color(design_system, "primary", "#2563EB")
    secondary = _color(design_system, "secondary", "#3B82F6")
    cta = _color(design_system, "cta", "#F97316")
    background = _color(design_system, "background", "#F8FAFC")
    text = _color(design_system, "text", "#1E293B")
    border = c.get("border") or "rgba(0,0,0,0.1)"
    muted = c.get("muted") or "rgba(0,0,0,0.5)"
    heading = (design_system.get("typography") or {}).get("heading", "Inter, sans-serif")
    body = (design_system.get("typography") or {}).get("body", "Inter, sans-serif")

    out: dict[str, Any] = {
        "$schema": "https://design-tokens.github.io/community-group/format/",
        "color": {
            "primary": {"$value": primary, "$type": "color"},
            "secondary": {"$value": secondary, "$type": "color"},
            "cta": {"$value": cta, "$type": "color"},
            "background": {"$value": background, "$type": "color"},
            "text": {"$value": text, "$type": "color"},
            "border": {"$value": border, "$type": "color"},
            "muted": {"$value": muted, "$type": "color"},
        },
        "font": {
            "heading": {"$value": str(heading), "$type": "fontFamily"},
            "body": {"$value": str(body), "$type": "fontFamily"},
        },
        "radius": {
            "sm": {"$value": t["radius_sm"], "$type": "dimension"},
            "md": {"$value": t["radius_md"], "$type": "dimension"},
            "lg": {"$value": t["radius_lg"], "$type": "dimension"},
        },
    }
    out["shadow"] = {
        "sm": {"$value": t["shadow_sm"], "$type": "boxShadow"},
        "md": {"$value": t["shadow_md"], "$type": "boxShadow"},
    }
    out["transition"] = {
        "fast": {"$value": t["transition_fast"], "$type": "duration"},
        "base": {"$value": t["transition_base"], "$type": "duration"},
    }
    out["space"] = {}
    for num, px in _SPACE_PX:
        out["space"][num] = {
            "$value": f"{px / 16.0}rem",
            "$type": "dimension",
        }
    return out


def to_json_summary(design_system: dict) -> dict[str, Any]:
    pat = design_system.get("pattern") or {}
    name = design_system.get("project_name", "")
    c = design_system.get("colors") or {}
    typo = design_system.get("typography") or {}
    ap = design_system.get("anti_patterns", "") or ""
    if isinstance(ap, str):
        anti = [x.strip() for x in re.split(r"\s*\+\s*", ap) if x.strip()] if ap else []
    else:
        anti = list(ap) if ap else []
    return {
        "project": str(name),
        "generated_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "style": (design_system.get("style") or {}).get("name", ""),
        "pattern": pat.get("name", "") if isinstance(pat, dict) else str(pat),
        "colors": {
            "primary": _color(design_system, "primary", "#2563EB"),
            "secondary": _color(design_system, "secondary", "#3B82F6"),
            "cta": _color(design_system, "cta", "#F97316"),
            "background": _color(design_system, "background", "#F8FAFC"),
            "text": _color(design_system, "text", "#1E293B"),
            "border": c.get("border", ""),
            "muted": c.get("muted", ""),
        },
        "typography": {
            "heading": str(typo.get("heading", "")),
            "body": str(typo.get("body", "")),
        },
        "anti_patterns": anti,
        "checklist": list(_CHECKLIST),
    }


def write_token_files(design_system: dict, out_dir: str) -> list[str]:
    base = Path(out_dir) if out_dir else Path("design-system")
    base.mkdir(parents=True, exist_ok=True)

    paths: list[str] = []
    p_css = base / "tokens.css"
    p_twj = base / "tailwind.config.tokens.js"
    p_w3c = base / "tokens.json"
    p_sum = base / "design-system.json"

    with open(p_css, "w", encoding="utf-8") as f:
        f.write(to_css_variables(design_system))
    paths.append(str(p_css.resolve()))

    with open(p_twj, "w", encoding="utf-8") as f:
        f.write(to_tailwind_config(design_system))
    paths.append(str(p_twj.resolve()))

    with open(p_w3c, "w", encoding="utf-8") as f:
        json.dump(to_w3c_tokens(design_system), f, indent=2, ensure_ascii=False)
        f.write("\n")
    paths.append(str(p_w3c.resolve()))

    with open(p_sum, "w", encoding="utf-8") as f:
        json.dump(to_json_summary(design_system), f, indent=2, ensure_ascii=False)
        f.write("\n")
    paths.append(str(p_sum.resolve()))

    return paths
