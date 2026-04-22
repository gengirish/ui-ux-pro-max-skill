#!/usr/bin/env python3
"""
Run golden-case evals against DesignSystemGenerator (BM25 + reasoning).

Usage (from repository root):
  python evals/run_evals.py
  python evals/run_evals.py --filter 'spa*'
  python evals/run_evals.py --update-snapshots
"""
from __future__ import annotations

import argparse
import fnmatch
import json
import sys
from dataclasses import asdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

# ---------------------------------------------------------------------------
# Path setup: design_system lives under src/ui-ux-pro-max/scripts
# ---------------------------------------------------------------------------
EVAL_DIR = Path(__file__).resolve().parent
REPO_ROOT = EVAL_DIR.parent
SCRIPTS_DIR = REPO_ROOT / "src" / "ui-ux-pro-max" / "scripts"

if str(SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_DIR))
if str(EVAL_DIR) not in sys.path:
    sys.path.insert(0, str(EVAL_DIR))

# pylint: disable=wrong-import-position
from design_system import DesignSystemGenerator  # noqa: E402
from schema import GoldenCase, GoldenExpected  # noqa: E402
from judges import (  # noqa: E402
    judge_anti_patterns,
    judge_style_band,
    judge_ui_category_band,
)

GOLDEN_PATH = EVAL_DIR / "golden_cases.yaml"
REPORT_PATH = EVAL_DIR / "last_run.json"
FIXTURES_DIR = EVAL_DIR / "fixtures" / "sample_outputs"


def _load_yaml(path: Path) -> List[dict]:
    try:
        import yaml  # type: ignore
    except ImportError:
        print(
            "ERROR: PyYAML is required. Install with: python -m pip install pyyaml",
            file=sys.stderr,
        )
        sys.exit(2)
    with open(path, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)
    if data is None:
        return []
    if not isinstance(data, list):
        raise ValueError("golden_cases.yaml must be a list of cases")
    return data


def _parse_cases(raw: List[dict]) -> List[GoldenCase]:
    out: List[GoldenCase] = []
    for item in raw:
        exp = item["expected"]
        expected = GoldenExpected(
            ui_category_band=exp["ui_category_band"],
            style_band=exp["style_band"],
            color_mood_includes_any=exp["color_mood_includes_any"],
            typography_mood_includes_any=exp["typography_mood_includes_any"],
            forbidden_anti_patterns=exp.get("forbidden_anti_patterns") or [],
        )
        out.append(
            GoldenCase(
                id=item["id"],
                prompt=item["prompt"],
                expected=expected,
                severity=item.get("severity", "HIGH"),
                skip=bool(item.get("skip", False)),
                sector=item.get("sector"),
            )
        )
    return out


def _color_mood_ok(design: dict, keywords: List[str]) -> Tuple[bool, Optional[str]]:
    if not keywords:
        return True, None
    pat = design.get("pattern") or {}
    parts = [
        str((design.get("colors") or {}).get("notes", "") or ""),
        str(pat.get("color_strategy", "") or ""),
        str(design.get("key_effects", "") or ""),
        str((design.get("style") or {}).get("keywords", "") or ""),
    ]
    hay = " ".join(parts).casefold()
    for kw in keywords:
        if kw and str(kw).strip().casefold() in hay:
            return True, None
    return (
        False,
        f"color_mood: none of {keywords!r} found in color notes / color strategy / effects",
    )


def _typography_mood_ok(
    design: dict, keywords: List[str]
) -> Tuple[bool, Optional[str]]:
    if not keywords:
        return True, None
    typo = design.get("typography") or {}
    parts = [
        str(typo.get("mood", "") or ""),
        str(typo.get("heading", "") or ""),
        str(typo.get("body", "") or ""),
    ]
    hay = " ".join(parts).casefold()
    for kw in keywords:
        if kw and str(kw).strip().casefold() in hay:
            return True, None
    return (
        False,
        f"typography_mood: none of {keywords!r} found in typography fields",
    )


def _run_one(gen: DesignSystemGenerator, case: GoldenCase) -> Dict[str, Any]:
    ex = case.expected
    err_parts: List[str] = []
    design = gen.generate(case.prompt, project_name=case.id)

    ok, err = judge_ui_category_band(design, ex.ui_category_band)
    if not ok and err:
        err_parts.append(err)

    ok, err = judge_style_band(design, ex.style_band)
    if not ok and err:
        err_parts.append(err)

    ok, err = _color_mood_ok(design, ex.color_mood_includes_any)
    if not ok and err:
        err_parts.append(err)

    ok, err = _typography_mood_ok(design, ex.typography_mood_includes_any)
    if not ok and err:
        err_parts.append(err)

    ok, err = judge_anti_patterns(design, ex.forbidden_anti_patterns)
    if not ok and err:
        err_parts.append(err)

    success = not err_parts
    return {
        "id": case.id,
        "ok": success,
        "error": " | ".join(err_parts) if err_parts else None,
        "category": design.get("category"),
        "style": (design.get("style") or {}).get("name"),
        "design_snapshot": design,
    }


def main() -> int:
    parser = argparse.ArgumentParser(description="UI/UX Pro Max golden evals")
    parser.add_argument(
        "--filter",
        default="*",
        help="Glob matched against case id (default: all)",
    )
    parser.add_argument(
        "--update-snapshots",
        action="store_true",
        help=f"Write JSON snapshots under {FIXTURES_DIR}",
    )
    args = parser.parse_args()

    raw = _load_yaml(GOLDEN_PATH)
    cases = _parse_cases(raw)
    gen = DesignSystemGenerator()

    passed = failed = skipped = 0
    results: List[Dict[str, Any]] = []
    flt = args.filter

    for case in cases:
        if case.skip:
            skipped += 1
            results.append(
                {
                    "id": case.id,
                    "ok": None,
                    "skipped": True,
                    "error": "marked skip in golden_cases.yaml",
                }
            )
            continue
        if not fnmatch.fnmatch(case.id, flt):
            skipped += 1
            results.append(
                {
                    "id": case.id,
                    "ok": None,
                    "skipped": True,
                    "error": f"excluded by --filter {flt!r}",
                }
            )
            continue

        row = _run_one(gen, case)
        snap = row.pop("design_snapshot", None)
        if row["ok"]:
            passed += 1
        else:
            failed += 1
        row["prompt"] = case.prompt
        row["expected"] = {
            "ui_category_band": case.expected.ui_category_band,
            "style_band": case.expected.style_band,
            "color_mood_includes_any": case.expected.color_mood_includes_any,
            "typography_mood_includes_any": case.expected.typography_mood_includes_any,
            "forbidden_anti_patterns": case.expected.forbidden_anti_patterns,
        }
        results.append(row)

        if args.update_snapshots and snap is not None:
            FIXTURES_DIR.mkdir(parents=True, exist_ok=True)
            p = FIXTURES_DIR / f"{case.id}.json"
            with open(p, "w", encoding="utf-8") as f:
                json.dump(
                    {
                        "id": case.id,
                        "prompt": case.prompt,
                        "generated_at": datetime.now(timezone.utc).isoformat(),
                        "design": snap,
                    },
                    f,
                    indent=2,
                    default=str,
                )

    summary_line = f"{passed} passed, {failed} failed, {skipped} skipped"
    print(summary_line)

    for row in results:
        if row.get("skipped") or row.get("ok"):
            continue
        print("---")
        print(f"FAIL  {row.get('id')}")
        print(f"  prompt: {row.get('prompt')!r}")
        print(f"  {row.get('error')}")
        ex = row.get("expected")
        if ex:
            print(f"  expected category band: {ex.get('ui_category_band')}")
            print(f"  actual category: {row.get('category')!r}")
            print(f"  expected style band: {ex.get('style_band')}")
            print(f"  actual style: {row.get('style')!r}")

    report = {
        "summary": {
            "passed": passed,
            "failed": failed,
            "skipped": skipped,
            "line": summary_line,
        },
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "filter": flt,
        "results": results,
    }
    with open(REPORT_PATH, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2, default=str)

    if failed:
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
