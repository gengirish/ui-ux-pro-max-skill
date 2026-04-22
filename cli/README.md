# uipro-cli

CLI to install UI/UX Pro Max skill for AI coding assistants.

## Installation

```bash
npm install -g uipro-cli
```

## Usage

```bash
# Install for specific AI assistant
uipro init --ai claude      # Claude Code
uipro init --ai cursor      # Cursor
uipro init --ai windsurf    # Windsurf
uipro init --ai antigravity # Antigravity
uipro init --ai copilot     # GitHub Copilot
uipro init --ai kiro        # Kiro
uipro init --ai codex       # Codex (Skills)
uipro init --ai roocode     # Roo Code
uipro init --ai qoder       # Qoder
uipro init --ai gemini      # Gemini CLI
uipro init --ai trae        # Trae
uipro init --ai opencode    # OpenCode
uipro init --ai continue    # Continue (Skills)
uipro init --ai all         # All assistants

# Options
uipro init --offline        # Skip GitHub download, use bundled assets only
uipro init --force          # Overwrite existing files

# Other commands
uipro versions              # List available versions
uipro update                # Update to latest version
```

## Auditing generated UI

`uipro audit` walks source files in a directory (default: current) and flags common anti-patterns in HTML/JSX/Vue/Svelte/Astro. Use it on generated or hand-written UI to catch “AI slop” gradients, missing focus states, and contrast issues.

```bash
# Scan the current project
uipro audit

# Scan a specific folder
uipro audit ./src/components

# JSON for CI
uipro audit --json

# Only HIGH-severity (accessibility) findings
uipro audit --severity HIGH
```

**Exit code:** `0` if there are no HIGH-severity issues; `1` if any HIGH rule matches (e.g. contrast, focus, or the purple–pink gradient rule), regardless of `--severity` filtering. Rules cover emoji-as-icons, `cursor-pointer` on clickables, fixed pixel type, Tailwind `bg-` + `text-` contrast (embedded palette, WCAG AA 4.5:1), and more. See the implementation under `src/audit/`.

**Telemetry:** `uipro telemetry` manages a local opt-in in `~/.config/uipro/`. This package does not send network requests yet; a future release will add the actual endpoint.

## How It Works

By default, `uipro init` tries to download the latest release from GitHub to ensure you get the most up-to-date version. If the download fails (network error, rate limit), it automatically falls back to the bundled assets included in the CLI package.

Use `--offline` to skip the GitHub download and use bundled assets directly.

## Development

```bash
# Install dependencies
bun install

# Run locally
bun run src/index.ts --help

# Build
bun run build

# If `bun` is not available: `npm install` then `npx tsc` (compiles to `dist/` the same as the bun build for this project).

# Link for local testing
bun link
```

## License

CC-BY-NC-4.0
