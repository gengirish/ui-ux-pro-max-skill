# UI/UX Pro Max design-system evals

These checks run the same pipeline as the skill (`DesignSystemGenerator` in `src/ui-ux-pro-max/scripts/design_system.py`): BM25 search over `products.csv`, `styles.csv`, `colors.csv`, `typography.csv`, `landing.csv`, plus `ui-reasoning.csv` rules. Each golden case describes **bands** of acceptable categories and styles, plus mood keywords and optional anti-patterns, so the harness stays stable as ranking varies.

## Run locally

From the repository root (this project):

```text
python -m pip install pyyaml
python evals/run_evals.py
```

Run a subset by case `id` (glob):

```text
python evals/run_evals.py --filter "beauty*"
```

Refresh JSON snapshots (one file per case under `evals/fixtures/sample_outputs/<id>.json`):

```text
python evals/run_evals.py --update-snapshots
```

Machine-readable output is written to `evals/last_run.json` (gitignored). Exit code `0` if every non-skipped case passes, `1` if any case fails, `2` if PyYAML is missing.

## Add a new case (three steps)

1. **Pick a target row** in `src/ui-ux-pro-max/data/products.csv` (column **Product Type**) and confirm the same label exists in `ui-reasoning.csv` (**UI_Category**). Write a **prompt** that consistently retrieves that type (try it in a REPL: `DesignSystemGenerator().generate("your prompt", "t")` and inspect `category`).

2. **Set bands, not point predictions**: list several plausible `Product Type` values in `ui_category_band`, and list many `Style Category` names from `styles.csv` in `style_band` (include mobile variants if your prompt is mobile-leaning).

3. **Mood & anti-patterns**: choose short substrings that appear in generated color notes, landing color strategy, effects, and typography `Mood/Style Keywords`. Use `forbidden_anti_patterns` only for phrases that must never appear in the combined color/effect text (e.g. avoid banning `neon` on gaming, where it is valid).

4. **Append** a new list item to `evals/golden_cases.yaml` following the same keys as the existing cases.

## Judge philosophy

- **UI category (pattern) band**: The top product hit must be one of the allowed `Product Type` strings.
- **Style band**: The selected **Style Category** must appear in the allowlist; we do not require the exact top style from `ui-reasoning.csv` `Style_Priority` because BM25 and tie-breaking vary.
- **Color / typography mood**: At least one token from `color_mood_includes_any` and `typography_mood_includes_any` must appear in the generated strings (substrings, case-insensitive for moods).
- **Anti-pattern**: Banned substrings are searched in color fields, `key_effects`, and style `Effects & Animation` (case-insensitive whole-phrase match per banned string).

## Layout

- `schema.py` — `GoldenCase` / `GoldenExpected` dataclasses (stdlib only).
- `run_evals.py` — loads YAML, runs the generator, applies judges, writes `last_run.json`.
- `judges/` — pattern (category) band, style band, and anti-pattern checks.
- `fixtures/sample_outputs/` — optional JSON snapshots from `--update-snapshots`.

See `.github/workflows/evals.yml` for the CI job that runs the same command and uploads the report artifact.
