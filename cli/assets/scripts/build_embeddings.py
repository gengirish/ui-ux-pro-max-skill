#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Build sentence-embedding index files for every table in `CSV_CONFIG` (see `core.py`).

Requires ``UIPRO_EMBEDDINGS=on`` and:

    pip install sentence-transformers numpy

Vectors and ids are written under ``~/.cache/uipro/embeddings/``.
"""
from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path


def _main() -> None:
    os.environ["UIPRO_EMBEDDINGS"] = "on"
    here = Path(__file__).resolve().parent
    if str(here) not in sys.path:
        sys.path.insert(0, str(here))

    parser = argparse.ArgumentParser(description="Build UI Pro Max embedding indices")
    parser.add_argument(
        "-f", "--force", action="store_true", help="Rebuild even if index files already exist"
    )
    args = parser.parse_args()

    from core import CSV_CONFIG
    from embeddings import _CACHE_ROOT, build_index

    built: list[Path] = []
    for domain in CSV_CONFIG:
        p = build_index(domain, force=args.force)
        built.append(p)
        print(f"OK {domain} -> {p}")

    total = 0
    if _CACHE_ROOT.exists():
        for fp in _CACHE_ROOT.rglob("*"):
            if fp.is_file():
                total += fp.stat().st_size
    print(f"Total disk usage under {_CACHE_ROOT}: {total} bytes ({total / 1024 / 1024:.2f} MiB)")


if __name__ == "__main__":
    _main()
