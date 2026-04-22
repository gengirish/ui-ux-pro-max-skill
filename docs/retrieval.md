# UI/UX Pro Max — retrieval

Search is built for short, product-specific queries. Every query goes through the same path:

1. **BM25** — Lexical score over the CSV text fields for that domain (always on). This stays fast and needs no extra installs.
2. **Synonyms** — A small map in `data/synonyms.json` expands colloquial words into terms that also appear in the database (e.g. “salon” adds *beauty*, *spa*, *wellness* so the query lines up with the “Beauty/Spa/Wellness” product row). Expansion is only applied to the BM25 query string, not to the optional embedding, so meaning drift stays smaller for dense vectors.
3. **Embeddings (optional)** — If you set `UIPRO_EMBEDDINGS=on` and install `sentence-transformers` and `numpy`, you can pre-build indices and blend cosine similarity with BM25. The mix is controlled with `--alpha` in the search CLI (default `0.5`).

## Examples

| You type | What improves |
| -------- | --------------- |
| “salon” | Synonyms add beauty/spa/wellness terms so the top product row is more likely to be **Beauty/Spa/Wellness** instead of an unrelated “appointment” match. |
| “crypto wallet” | The map adds web3, nft, blockchain-style tokens so product search aligns with **Fintech/Crypto** or **NFT/Web3** rows. |
| “personal site” / “link in bio” | Expansions include portfolio, editorial, and creator-style terms so retrievers favor **Portfolio/Personal** or **Link-in-Bio Page Builder**-style entries. |

## CLI flags

- `--alpha` — Blends BM25 and embedding scores when embeddings are on (`0` = only embedding rank, `1` = only BM25 after normalization in the combiner; default `0.5`).
- `--no-synonyms` — Turns off `synonyms.json` expansion to debug pure lexical behavior.

## One-time setup for dense search

```bash
set UIPRO_EMBEDDINGS=on
pip install sentence-transformers numpy
python src/ui-ux-pro-max/scripts/build_embeddings.py
```

Indices are stored under `%USERPROFILE%\.cache\uipro\embeddings\` on Windows and `~/.cache/uipro/embeddings/` elsewhere. The model is `BAAI/bge-small-en-v1.5` (downloaded on first use).

## Defaults

With **no** environment variable and **no** optional packages, behavior stays BM25 plus synonyms only—no model download and no change to the Python you already use for search.
