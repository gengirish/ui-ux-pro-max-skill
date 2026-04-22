# Data JSON Schemas

## Why this exists

The UI/UX Pro Max knowledge base ships as many large CSVs under `src/ui-ux-pro-max/data/`, mirrored in `cli/assets/data/` for the CLI. Silent corruption—wrong headers, a dropped column, an extra comma splitting a cell—used to be easy to miss in review. The JSON Schemas in this directory describe one **row** of each top-level data file. They are checked in CI so structurally invalid or inconsistent rows fail fast and loudly.

`CSV_CONFIG` in `src/ui-ux-pro-max/scripts/core.py` documents how each file is used by the search engine; schemas align with those file names and column headers, not the stack-specific CSVs under `data/stacks/`.

## How to add a new column to an existing file

1. Add the column to the CSV **header** and backfill or fill values for all rows in **both** `src/ui-ux-pro-max/data/<file>.csv` and `cli/assets/data/<file>.csv` (keep them in lockstep).
2. Update the matching `schemas/<name>.schema.json`: add the column to `required`, add a `properties` entry with a sensible `type` and any `pattern`, `enum`, `minLength`, or `description` notes.
3. Run `python tools/validate_csvs.py` and fix any reported issues (or, if the data is intentionally heterogeneous, relax the field to `string` and document in `description` for a follow-up split).

## How to add a whole new domain CSV

1. Add the file next to the others in `src/ui-ux-pro-max/data/` and mirror to `cli/assets/data/`.
2. Register it in `src/ui-ux-pro-max/scripts/core.py` `CSV_CONFIG` (and any loader code) as needed.
3. Add `schemas/<basename>.schema.json` with `type: "object"`, `additionalProperties: false`, all headers in `required`, and `properties` for each column.
4. Map the file in `tools/validate_csvs.py` `CSV_TO_SCHEMA` to that schema.
5. Extend `.github/workflows/data-validation.yml` path filters if the workflow should run when only that file changes (the existing `**/*.csv` and `tools/validate_csvs.py` rules usually suffice).

## JSON export helper

For one-off or scripted exports (e.g. prototyping consumers that expect JSON), use:

```bash
python tools/csv_to_json.py src/ui-ux-pro-max/data/styles.csv
# writes tools/exports/styles.json
```

## Roadmap

A future change may make JSON the source of truth in-repo and treat CSVs as a legacy or export view. The `tools/csv_to_json.py` helper is there to make that migration and spot-checks easier; it does not need to be run in normal development.
