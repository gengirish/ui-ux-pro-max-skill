#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Opt-in sentence embeddings for UI/UX Pro Max (lazy-imports; BM25 still works without deps).

Set UIPRO_EMBEDDINGS=on to enable. Requires: pip install sentence-transformers numpy
"""

import csv
import json
import os
from pathlib import Path
from typing import Any

# Re-imported at runtime when UIPRO_EMBEDDINGS=on
_np = None
_SentenceTransformer = None

# Relative to this file: ../data, cache under user home
_DATA_DIR = Path(__file__).resolve().parent.parent / "data"
_CACHE_ROOT = Path(os.path.expanduser("~")) / ".cache" / "uipro" / "embeddings"


def _env_on() -> bool:
    v = (os.environ.get("UIPRO_EMBEDDINGS") or "off").strip().lower()
    return v in ("1", "true", "yes", "on")


def _lazy_load():
    global _np, _SentenceTransformer
    if _np is not None and _SentenceTransformer is not None:
        return
    import numpy as np
    from sentence_transformers import SentenceTransformer
    _np = np
    _SentenceTransformer = SentenceTransformer


def embeddings_available() -> bool:
    if not _env_on():
        return False
    try:
        _lazy_load()
    except Exception:
        return False
    return True


def _get_core_csv_config():
    from core import CSV_CONFIG
    return CSV_CONFIG


def _stem_for_domain(domain: str) -> str:
    cfg = _get_core_csv_config()
    c = cfg.get(domain) or {}
    f = c.get("file", "")
    return Path(f).stem if f else domain


def _path_npy(stem: str) -> Path:
    return _CACHE_ROOT / f"{stem}.npy"


def _path_ids(stem: str) -> Path:
    return _CACHE_ROOT / f"{stem}.ids.json"


def _read_csv_rows(filename: str) -> list[dict[str, str]]:
    path = _DATA_DIR / filename
    if not path.exists():
        return []
    with open(path, "r", encoding="utf-8") as f:
        return [dict(r) for r in csv.DictReader(f)]


def _rows_to_texts(filename: str, search_cols: list[str]) -> list[str]:
    rows = _read_csv_rows(filename)
    return [" ".join(str(row.get(c, "")) for c in search_cols) for row in rows]


def _model():
    _lazy_load()
    os.environ.setdefault("SENTENCE_TRANSFORMERS_HOME", str(_CACHE_ROOT.parent / "hf"))
    return _SentenceTransformer("BAAI/bge-small-en-v1.5", cache_folder=str(_CACHE_ROOT.parent / "hf"))


def build_index(csv_name: str, force: bool = False) -> Path:
    """
    Build a numpy index for a CSV in CSV_CONFIG. csv_name is a domain key (e.g. 'product')
    or a file stem (e.g. 'products').

    Returns path to the .npy file, or raises if UIPRO_EMBEDDINGS is off or deps missing.
    """
    if not _env_on():
        raise RuntimeError("UIPRO_EMBEDDINGS is not on")
    _lazy_load()
    np = _np
    cfg = _get_core_csv_config()
    domain = None
    for k, v in cfg.items():
        if k == csv_name or Path(v.get("file", "")).stem == csv_name:
            domain = k
            break
    if domain is None:
        raise ValueError(f"Unknown csv/domain: {csv_name!r}")
    file = cfg[domain]["file"]
    search_cols = cfg[domain]["search_cols"]
    stem = Path(file).stem
    _CACHE_ROOT.mkdir(parents=True, exist_ok=True)
    npy = _path_npy(stem)
    ids_p = _path_ids(stem)
    if not force and npy.exists() and ids_p.exists():
        return npy

    texts = _rows_to_texts(file, search_cols)
    rows = _read_csv_rows(file)
    ids: list[dict] = []
    for i, row in enumerate(rows):
        no = row.get("No", str(i + 1))
        ids.append({"index": i, "No": no, "row": row})

    m = _model()
    # batch encode
    vecs = m.encode(
        texts,
        normalize_embeddings=True,
        show_progress_bar=True,
    )
    arr = np.asarray(vecs, dtype=np.float32)
    np.save(npy, arr)
    with open(ids_p, "w", encoding="utf-8") as f:
        json.dump(ids, f, ensure_ascii=False, indent=0)
    return npy


def _load_index(stem: str) -> tuple["Any", list] | None:
    if not _env_on():
        return None
    npy, ids_p = _path_npy(stem), _path_ids(stem)
    if not npy.exists() or not ids_p.exists():
        return None
    _lazy_load()
    np = _np
    arr = np.load(npy)
    with open(ids_p, "r", encoding="utf-8") as f:
        ids = json.load(f)
    return arr, ids


def query(csv_name: str, text: str, top_k: int = 10) -> list[tuple[int, float]]:
    """
    Return (row No as int when possible, cosine similarity) for top_k rows.
    csv_name: domain key (e.g. 'product') or file stem ('products').
    """
    if not _env_on():
        return []
    _lazy_load()
    np = _np
    cfg = _get_core_csv_config()
    domain = None
    for k, v in cfg.items():
        if k == csv_name or Path(v.get("file", "")).stem == csv_name:
            domain = k
            break
    if domain is None:
        return []
    file = cfg[domain]["file"]
    stem = Path(file).stem
    idx = _load_index(stem)
    if not idx:
        return []
    arr, ids = idx
    m = _model()
    q = m.encode([text], normalize_embeddings=True)
    qv = np.asarray(q, dtype=np.float32)
    # cosine with normalized rows = dot product
    sims = (arr * qv).sum(axis=1)
    order = np.argsort(-sims)[: min(top_k, len(sims))]
    out: list[tuple[int, float]] = []
    for j in order:
        entry = ids[j] if j < len(ids) else {}
        no = entry.get("No", j + 1)
        try:
            noi = int(float(str(no).strip())) if str(no).strip() != "" else j + 1
        except ValueError:
            noi = j + 1
        out.append((noi, float(sims[j])))
    return out


def query_all_scores(csv_name: str, text: str) -> list[tuple[int, float]]:
    """All rows: (row data index 0..N-1, cosine). Used by hybrid; index aligns with in-memory data rows order."""
    if not _env_on():
        return []
    _lazy_load()
    np = _np
    cfg = _get_core_csv_config()
    domain = None
    for k, v in cfg.items():
        if k == csv_name or Path(v.get("file", "")).stem == csv_name:
            domain = k
            break
    if domain is None:
        return []
    file = cfg[domain]["file"]
    stem = Path(file).stem
    idx = _load_index(stem)
    if not idx:
        return []
    arr, _ids = idx
    m = _model()
    qv = np.asarray(m.encode([text], normalize_embeddings=True), dtype=np.float32)
    sims = (arr * qv).sum(axis=1)
    return [(i, float(sims[i])) for i in range(len(sims))]


def index_exists_for_domain(domain: str) -> bool:
    stem = _stem_for_domain(domain)
    return _path_npy(stem).exists() and _path_ids(stem).exists()
