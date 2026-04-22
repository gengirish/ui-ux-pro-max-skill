# Architecture and contributing

## For users

The codebase uses a **template-based generation system**. All platform-specific files (`.cursor/`, `.windsurf/`, `.kiro/`, `.factory/`, and others) are generated dynamically by the CLI.

**Always use the CLI to install:**

```bash
npm install -g uipro-cli
uipro init --ai <platform>
```

This ensures you get the latest templates and the correct file structure for your AI assistant.

## For contributors

If you want to contribute to this project:

```bash
# 1. Clone the repository
git clone https://github.com/nextlevelbuilder/ui-ux-pro-max-skill.git
cd ui-ux-pro-max-skill

# 2. Understand the structure
src/ui-ux-pro-max/           # Source of truth (data, scripts, templates)
cli/                         # CLI installer (generates files from templates)
.claude/                     # Local dev/test for Claude Code skill
.factory/                    # Local dev/test for Droid (Factory) skill

# 3. Make changes in src/ui-ux-pro-max/
# - data/*.csv              → Database files
# - scripts/*.py            → Search engine & design system
# - templates/              → Platform-specific templates

# 4. Sync to CLI and test locally
cp -r src/ui-ux-pro-max/data/* cli/assets/data/
cp -r src/ui-ux-pro-max/scripts/* cli/assets/scripts/
cp -r src/ui-ux-pro-max/templates/* cli/assets/templates/

# 5. Build and test CLI
cd cli && bun run build
node dist/index.js init --ai claude --offline  # Test in a temp folder

# 6. Create PR (never push directly to main)
git checkout -b feat/your-feature
git commit -m "feat: description"
git push -u origin feat/your-feature
gh pr create
```

See [CLAUDE.md](../CLAUDE.md) for detailed development guidelines (search domains, `src/` layout, sync rules).

---

Back to the [main README](../README.md).
