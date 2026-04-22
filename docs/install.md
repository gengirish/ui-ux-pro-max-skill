# Installation and hosts

## Claude Marketplace (Claude Code)

Install directly in Claude Code with two commands:

```text
/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill
/plugin install ui-ux-pro-max@ui-ux-pro-max-skill
```

## CLI (recommended)

```bash
# Install CLI globally
npm install -g uipro-cli

# Go to your project
cd /path/to/your/project

# Install for your AI assistant
uipro init --ai claude      # Claude Code
uipro init --ai cursor      # Cursor
uipro init --ai windsurf    # Windsurf
uipro init --ai antigravity # Antigravity
uipro init --ai copilot     # GitHub Copilot
uipro init --ai kiro        # Kiro
uipro init --ai codex       # Codex CLI
uipro init --ai qoder       # Qoder
uipro init --ai roocode     # Roo Code
uipro init --ai gemini      # Gemini CLI
uipro init --ai trae        # Trae
uipro init --ai opencode    # OpenCode
uipro init --ai continue    # Continue
uipro init --ai codebuddy   # CodeBuddy
uipro init --ai droid       # Droid (Factory)
uipro init --ai kilocode    # KiloCode
uipro init --ai warp        # Warp
uipro init --ai augment     # Augment
uipro init --ai all         # All assistants
```

## Global install (available for all projects)

```bash
uipro init --ai claude --global   # Install to ~/.claude/skills/
uipro init --ai cursor --global   # Install to ~/.cursor/skills/
```

## Other CLI commands

```bash
uipro versions              # List available versions
uipro update                # Update to latest version
uipro init --offline        # Skip GitHub download, use bundled assets
uipro uninstall             # Remove skill (auto-detect platform)
uipro uninstall --ai claude # Remove specific platform
uipro uninstall --global    # Remove from global install
```

## `uipro init` matrix by host

| Host | Flag | Notes |
|------|------|--------|
| Claude Code | `claude` | Also available via [Claude Marketplace](#claude-marketplace-claude-code) |
| Cursor | `cursor` | |
| Windsurf | `windsurf` | |
| Antigravity | `antigravity` | |
| GitHub Copilot | `copilot` | |
| Kiro | `kiro` | |
| Codex CLI | `codex` | |
| Qoder | `qoder` | |
| Roo Code | `roocode` | |
| Gemini CLI | `gemini` | |
| Trae | `trae` | **Trae:** switch to **SOLO** mode first for UI/UX skills |
| OpenCode | `opencode` | |
| Continue | `continue` | If paths in docs say `.claude/skills/`, use `.continue/skills/` |
| CodeBuddy | `codebuddy` | |
| Droid (Factory) | `droid` | Skill under `.factory/skills/` |
| KiloCode | `kilocode` | |
| Warp | `warp` | |
| Augment | `augment` | |
| All supported | `all` | |

## Prerequisites

Python 3.x is required for the search script.

```bash
# Check if Python is installed
python3 --version

# macOS
brew install python3

# Ubuntu/Debian
sudo apt update && sudo apt install python3

# Windows
winget install Python.Python.3.12
```

## Usage after install

### Skill mode (auto-activate)

**Supported:** Claude Code, Cursor, Windsurf, Antigravity, Codex CLI, Continue, Gemini CLI, OpenCode, Qoder, CodeBuddy, Droid (Factory), KiloCode, Warp, Augment

The skill activates automatically when you request UI/UX work. Example:

```text
Build a landing page for my SaaS product
```

### Workflow mode (slash command)

**Supported:** Kiro, GitHub Copilot, Roo Code, KiloCode

```text
/ui-ux-pro-max Build a landing page for my SaaS product
```

### Example prompts

```text
Build a landing page for my SaaS product

Create a dashboard for healthcare analytics

Design a portfolio website with dark mode

Make a mobile app UI for e-commerce

Build a fintech banking app with dark theme
```

### How it works (in the assistant)

1. **You ask** — Any UI/UX task (build, design, create, implement, review, fix, improve)
2. **Design system generated** — A complete design system is produced via the reasoning engine
3. **Smart recommendations** — Best matching styles, colors, and typography for the product type
4. **Code generation** — UI with proper colors, fonts, spacing, and practices
5. **Pre-delivery checks** — Validation against common UI/UX anti-patterns

### Supported stacks

The skill provides stack-specific guidelines for:

| Category | Stacks |
|----------|--------|
| **Web (HTML)** | HTML + Tailwind (default) |
| **React Ecosystem** | React, Next.js, shadcn/ui |
| **Vue Ecosystem** | Vue, Nuxt.js, Nuxt UI |
| **Angular** | Angular |
| **PHP** | Laravel (Blade, Livewire, Inertia.js) |
| **Other Web** | Svelte, Astro |
| **iOS** | SwiftUI |
| **Android** | Jetpack Compose |
| **Cross-Platform** | React Native, Flutter |

Mention your preferred stack in the prompt, or let it default to HTML + Tailwind.

---

Back to the [main README](../README.md).
