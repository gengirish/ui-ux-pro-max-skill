#!/usr/bin/env python3
"""Convert a data CSV to a JSON array of row objects (migration helper, stdlib only)."""
from __future__ import annotations

import argparse
import csv
import json
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
DEFAULT_OUT_DIR = REPO / "tools" / "exports"


def main() -> int:
    p = argparse.ArgumentParser(
        description="Read a UI/UX Pro Max data CSV, write JSON array to tools/exports/."
    )
    p.add_argument(
        "csv_path",
        type=Path,
        help="Path to a .csv file (e.g. src/ui-ux-pro-max/data/styles.csv).",
    )
    p.add_argument(
        "-o",
        "--output",
        type=Path,
        help="Output .json path (default: tools/exports/<csv-stem>.json).",
    )
    p.add_argument(
        "--indent",
        type=int,
        default=2,
        help="JSON indent (default: 2; use 0 for minified).",
    )
    args = p.parse_args()
    src = args.csv_path.resolve()
    if not src.is_file():
        print(f"error: not a file: {src}", file=sys.stderr)
        return 1
    out = args.output
    if out is None:
        DEFAULT_OUT_DIR.mkdir(parents=True, exist_ok=True)
        out = DEFAULT_OUT_DIR / f"{src.stem}.json"
    else:
        out = out.resolve()
        out.parent.mkdir(parents=True, exist_ok=True)

    with open(src, encoding="utf-8", newline="") as f:
        rows = list(csv.DictReader(f))
    with open(out, "w", encoding="utf-8") as f:
        if args.indent and args.indent > 0:
            json.dump(rows, f, ensure_ascii=False, indent=args.indent)
        else:
            json.dump(rows, f, ensure_ascii=False, separators=(",", ":"))
        f.write("\n")
    print(f"Wrote {len(rows)} rows to {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
