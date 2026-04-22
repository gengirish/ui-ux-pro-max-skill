# @uipro/mcp-server

**Status: alpha** — feedback and issue reports are welcome.

The [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) is an open standard for how applications expose tools, resources, and prompts to AI assistants. This package runs an MCP **server** that wraps the same UI/UX Pro Max data and Python search engine used by the `uipro` CLI, so any MCP-capable client (Claude Desktop, Cursor, VS Code, Continue, etc.) can use that design intelligence without per-host template installs.

## Requirements

- **Node.js** 18+ (for the MCP server)
- **Python 3** on `PATH` for tools that shell out to `src/ui-ux-pro-max/scripts/search.py` (acknowledged tech debt; a future version may use native TypeScript for search)

## Install

```bash
npm install -g @uipro/mcp-server
```

From a clone of the repo, use `npx` against the built `dist/` or run `npm run build` first.

## Claude Desktop

Add a server entry to your Claude Desktop config (e.g. `%APPDATA%\Claude\claude_desktop_config.json` on Windows, `~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "uipro": {
      "command": "uipro-mcp",
      "args": [],
      "env": { "UIPRO_DATA_DIR": "" }
    }
  }
}
```

Set `UIPRO_DATA_DIR` to the absolute path of `src/ui-ux-pro-max/data` in your repository if you are not running from a published package with bundled `assets/data`. Leave empty to rely on the default resolution (see [Data directory](#data-directory)).

## Cursor

`~/.cursor/mcp.json` (or the project’s `.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "uipro": {
      "command": "uipro-mcp",
      "args": [],
      "env": { "UIPRO_DATA_DIR": "" }
    }
  }
}
```

## Tools

| Tool | Description |
| --- | --- |
| `generate_design_system` | Full design system recommendation from a product prompt (`search.py --design-system`). |
| `search_styles` | BM25 search in the **style** domain; JSON output. |
| `recommend_palette` | **Color** domain search for an industry and optional mood. |
| `get_stack_guidelines` | **Stack**-specific guidelines (React, Next.js, etc.). |
| `audit_html` | **Stub** — returns a placeholder; full implementation will delegate to the `uipro` CLI in a follow-up. |

## Resources

| URI | Description |
| --- | --- |
| `uipro://styles/{id}` | One row from `styles.csv` as JSON (`No` = id). |
| `uipro://palettes/{id}` | One row from `colors.csv` as JSON. |
| `uipro://master-design-system` | `design-system/MASTER.md` from the **current working directory** of the server process, or a JSON 404-style hint to run `uipro init`. |

## Data directory

Resolution order:

1. Environment variable `UIPRO_DATA_DIR` (absolute path to a folder containing `styles.csv` and `colors.csv`).
2. `../src/ui-ux-pro-max/data` next to the `mcp-server` package (monorepo / git clone).
3. `mcp-server/assets/data` (bundled fallback; ships empty in this PR — a CI step can copy CSVs at build time).

## HTTP transport

The CLI accepts `--http` as a **stub** only: it prints that HTTP is coming in a follow-up and exits with code 1. Default transport is **stdio**.

## Build & test

```bash
npm run build
npx tsc
npm test
```

Tests use `node --test` with `tsx` to load TypeScript. They boot the real stdio server, run `list_tools` / `list_resources`, and call the `audit_html` stub (no Python required for that path).

## PR notes: bundled data

To ship CSVs in the npm package, add a build step that copies `src/ui-ux-pro-max/data/*` into `mcp-server/assets/data/` before `npm pack` / publish. This PR only adds `assets/data/.gitkeep`.
