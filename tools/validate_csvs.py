#!/usr/bin/env python3
"""Validate top-level UI/UX Pro Max data CSVs against JSON Schemas (stdlib only)."""
from __future__ import annotations

import argparse
import csv
import json
import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
SCHEMAS_DIR = REPO / "schemas"
SRC_DATA = REPO / "src" / "ui-ux-pro-max" / "data"
CLI_DATA = REPO / "cli" / "assets" / "data"

# Basename -> schema filename
CSV_TO_SCHEMA: dict[str, str] = {
    "styles.csv": "styles.schema.json",
    "colors.csv": "colors.schema.json",
    "charts.csv": "charts.schema.json",
    "landing.csv": "landing.schema.json",
    "products.csv": "products.schema.json",
    "ui-reasoning.csv": "ui-reasoning.schema.json",
    "ux-guidelines.csv": "ux-guidelines.schema.json",
    "typography.csv": "typography.schema.json",
    "icons.csv": "icons.schema.json",
    "google-fonts.csv": "google-fonts.schema.json",
}


class ValidationError(Exception):
    def __init__(self, message: str) -> None:
        self.message = message
        super().__init__(message)


def _validate_value(value, schema: object, path: str) -> None:
    if not isinstance(schema, dict):
        raise ValidationError(f"{path}: invalid schema (not an object)")

    if "oneOf" in schema:
        sub = schema["oneOf"]
        if not isinstance(sub, list) or not sub:
            raise ValidationError(f"{path}: oneOf must be a non-empty array")
        last_err: str | None = None
        for i, s in enumerate(sub):
            try:
                _validate_value(value, s, f"{path} (oneOf[{i}])")
                return
            except ValidationError as e:
                last_err = e.message
        assert last_err is not None
        raise ValidationError(
            f"{path}: no oneOf alternative matched — last: {last_err}"
        )

    t = schema.get("type")
    if t not in (None, "object", "string", "integer"):
        return

    if t == "object":
        if not isinstance(value, dict):
            raise ValidationError(
                f"{path}: expected object, got {type(value).__name__}"
            )
        req = set(schema.get("required") or [])
        for k in req:
            if k not in value or value[k] is None:
                raise ValidationError(
                    f"{path}: required property {k!r} missing or null"
                )
        add = schema.get("additionalProperties")
        props = schema.get("properties")
        if add is False and isinstance(props, dict):
            for k in value:
                if k not in props:
                    raise ValidationError(
                        f"{path}: additional property {k!r} not allowed"
                    )
        if isinstance(props, dict):
            for k, subschema in props.items():
                if k in value:
                    _validate_value(
                        value[k], subschema, f"{path}.{k}" if path else k
                    )
        return

    if t == "string":
        if not isinstance(value, str):
            raise ValidationError(
                f"{path}: expected string, got {type(value).__name__!r} ({value!r})"
            )
        if "enum" in schema:
            allowed = schema["enum"]
            if value not in allowed:
                raise ValidationError(
                    f"{path} value {value!r} not in enum {allowed}"
                )
        if "pattern" in schema:
            p = schema["pattern"]
            if not re.fullmatch(p, value):
                raise ValidationError(
                    f"{path} value {value!r} does not match pattern {p!r}"
                )
        if "minLength" in schema:
            m = int(schema["minLength"])
            if len(value) < m:
                raise ValidationError(
                    f"{path} length {len(value)} < minLength {m}"
                )
        return

    if t == "integer":
        if isinstance(value, int):
            n = value
        elif isinstance(value, str):
            s = value.strip()
            if not s or not re.fullmatch(r"-?[0-9]+", s):
                raise ValidationError(
                    f"{path} expected integer, got {value!r}"
                )
            n = int(s)
        else:
            raise ValidationError(
                f"{path}: expected integer, got {type(value).__name__!r} ({value!r})"
            )
        if "minimum" in schema:
            min_v = int(schema["minimum"])
            if n < min_v:
                raise ValidationError(
                    f"{path} value {n} < minimum {min_v}"
                )
        return


def validate_row(row: dict, schema: dict, rownum: int) -> list[str]:
    """Return list of error strings for the row. Empty = valid."""
    errors: list[str] = []
    if None in row:
        rest = row[None]
        n = len(rest) if isinstance(rest, list) else 1
        return [
            f"ROW {rownum} INVALID: {n} extra CSV field(s) "
            f"(row has more values than header columns; possible merged row or unescaped comma)"
        ]
    try:
        _validate_value(row, schema, "$")
    except ValidationError as e:
        msg = e.message
        if msg.startswith("$."):
            msg = msg[2:]
        errors.append(f"ROW {rownum} INVALID: {msg}")
    return errors


def load_schema(name: str) -> dict:
    p = SCHEMAS_DIR / name
    with open(p, encoding="utf-8") as f:
        return json.load(f)


def read_csv_dicts(path: Path) -> tuple[list[str], list[dict[str, str]]]:
    with open(path, "r", encoding="utf-8", newline="") as f:
        r = csv.DictReader(f)
        fieldnames = list(r.fieldnames or [])
        rows = [dict(x) for x in r]
    return fieldnames, rows


def report_line(name: str, msg: str, width: int = 26) -> None:
    pad = "." * max(3, width - len(name))
    print(f"{name} {pad} {msg}")


def main() -> int:
    ap = argparse.ArgumentParser(
        description="Validate mirrored CSVs against JSON Schemas."
    )
    mode = ap.add_mutually_exclusive_group()
    mode.add_argument(
        "--strict",
        action="store_true",
        dest="strict",
        help="Exit with status 1 on validation failure or src/cli drift (default).",
    )
    mode.add_argument(
        "--no-strict",
        action="store_false",
        dest="strict",
        help="Always exit 0 (for debugging only).",
    )
    ap.set_defaults(strict=True)
    ap.add_argument(
        "--fix-case",
        action="store_true",
        help="optional case normalization; not implemented",
    )
    args = ap.parse_args()
    if args.fix_case:
        print(
            "TODO: --fix-case (e.g. normalize severity) not implemented; "
            "use manual CSV edits in a data PR."
        )
    any_fail = False
    for csv_name, schema_file in sorted(CSV_TO_SCHEMA.items()):
        src_path = SRC_DATA / csv_name
        cli_path = CLI_DATA / csv_name
        if not src_path.is_file() or not cli_path.is_file():
            report_line(
                csv_name,
                f"MISSING FILE src={src_path.is_file()} cli={cli_path.is_file()}",
            )
            any_fail = True
            continue

        f_src, rows_src = read_csv_dicts(src_path)
        f_cli, rows_cli = read_csv_dicts(cli_path)
        if f_src != f_cli:
            report_line(
                csv_name,
                f"DRIFT: headers differ (src {len(f_src)} cols vs cli {len(f_cli)} cols)",
            )
            any_fail = True
        elif len(rows_src) != len(rows_cli):
            report_line(
                csv_name,
                f"DRIFT: row count src={len(rows_src)} vs cli={len(rows_cli)}",
            )
            any_fail = True

        try:
            sch = load_schema(schema_file)
        except OSError as e:
            report_line(csv_name, f"SCHEMA ERROR: {e}")
            any_fail = True
            continue

        for side, path, nrows, rows in (
            ("src", src_path, len(rows_src), rows_src),
            ("cli", cli_path, len(rows_cli), rows_cli),
        ):
            err_lines: list[str] = []
            for i, row in enumerate(rows, 1):
                for e in validate_row(row, sch, i):
                    err_lines.append(f"{csv_name} ({side}) ........ {e}")
            if err_lines:
                any_fail = True
                for el in err_lines:
                    print(el)
            else:
                report_line(
                    f"{csv_name} ({side})",
                    f"{nrows} rows OK",
                )

    if args.strict and any_fail:
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
