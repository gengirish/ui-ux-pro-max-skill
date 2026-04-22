#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Tests for hybrid retrieval, synonyms, and BM25 fallback."""
from __future__ import annotations

import os
import sys
import unittest
from pathlib import Path

# Scripts directory on path
_ROOT = Path(__file__).resolve().parent.parent
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from core import (  # noqa: E402
    DATA_DIR,
    expand_query_for_bm25,
    hybrid_search,
    _search_csv,
    CSV_CONFIG,
)


class TestSynonymsExpansion(unittest.TestCase):
    def test_salon_includes_spelling_terms(self) -> None:
        q = expand_query_for_bm25("salon", True)
        low = q.lower()
        for w in ("beauty", "spa", "wellness"):
            self.assertIn(w, low, f"missing expansion term {w!r} in {q!r}")


class TestBMAndHybrid(unittest.TestCase):
    SAMPLES = [
        ("SaaS dashboard", "product"),
        ("e-commerce store", "product"),
        ("healthcare app", "product"),
        ("minimal portfolio", "product"),
        ("fintech", "product"),
    ]

    @unittest.skipIf(
        (os.environ.get("UIPRO_EMBEDDINGS") or "").strip().lower() in ("1", "on", "true", "yes"),
        "set UIPRO_EMBEDDINGS off to compare pure BM25 to legacy",
    )
    def test_bm25_off_embeddings_matches_legacy_top1(self) -> None:
        for query, domain in self.SAMPLES:
            cfg = CSV_CONFIG[domain]
            fp = DATA_DIR / cfg["file"]
            old = _search_csv(fp, cfg["search_cols"], cfg["output_cols"], query, 1)
            new = hybrid_search(
                query, domain, 1, alpha=0.5, use_synonyms=False, embedding_query=query
            )
            t_old = (old[0].get("Product Type") or old[0].get("Style Category") or "") if old else ""
            t_new = (new[0].get("Product Type") or new[0].get("Style Category") or "") if new else ""
            self.assertEqual(
                t_old,
                t_new,
                f"top-1 mismatch for {query!r} domain={domain}: legacy={t_old!r} hybrid={t_new!r}",
            )

    def test_salon_finds_beauty_spa_in_top3(self) -> None:
        r = hybrid_search("salon", "product", 3, alpha=0.5, use_synonyms=True, embedding_query="salon")
        types = " ".join(x.get("Product Type", "") for x in r)
        self.assertIn("Beauty", types)
        self.assertIn("Spa", types or "")


@unittest.skipUnless(
    (os.environ.get("UIPRO_EMBEDDINGS") or "").strip().lower() in ("1", "true", "yes", "on"),
    "embeddings disabled",
)
class TestEmbeddingsOn(unittest.TestCase):
    def test_query_returns_tuple_scores(self) -> None:
        from embeddings import index_exists_for_domain, query

        if not index_exists_for_domain("product"):
            self.skipTest("no index on disk; run build_embeddings.py with UIPRO_EMBEDDINGS=on")
        out = query("product", "SaaS", top_k=2)
        self.assertTrue(len(out) >= 1)
        for row_no, sim in out:
            self.assertIsInstance(row_no, int)
            self.assertIsInstance(sim, float)


if __name__ == "__main__":
    unittest.main()
