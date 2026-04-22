# Advanced usage

Full documentation for design system commands, Python flags, and the Master + Overrides pattern. For a shorter overview, see the [main README](../README.md).

## Design system command

For direct access to the design system generator:

> Note: If you installed via Continue, replace `.claude/skills/` with `.continue/skills/` in the commands below. For Droid (Factory), use `.factory/skills/`.

```bash
# Generate design system with ASCII output
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "beauty spa wellness" --design-system -p "Serenity Spa"

# Generate with Markdown output
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "fintech banking" --design-system -f markdown

# Domain-specific search
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "glassmorphism" --domain style
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "elegant serif" --domain typography
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "dashboard" --domain chart

# Stack-specific guidelines
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "form validation" --stack react
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "responsive layout" --stack html-tailwind
```

## Persist design system (Master + Overrides pattern)

Save your design system to files for **hierarchical retrieval across sessions**:

```bash
# Generate and persist to design-system/MASTER.md
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "SaaS dashboard" --design-system --persist -p "MyApp"

# Also create a page-specific override file
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "SaaS dashboard" --design-system --persist -p "MyApp" --page "dashboard"
```

This creates a `design-system/` folder structure:

```text
design-system/
├── MASTER.md           # Global Source of Truth (colors, typography, spacing, components)
└── pages/
    └── dashboard.md    # Page-specific overrides (only deviations from Master)
```

**How hierarchical retrieval works:**

1. When building a specific page (e.g. "Checkout"), first check `design-system/pages/checkout.md`
2. If the page file exists, its rules **override** the Master file
3. If not, use `design-system/MASTER.md` exclusively

**Context-aware retrieval prompt:**

```text
I am building the [Page Name] page. Please read design-system/MASTER.md.
Also check if design-system/pages/[page-name].md exists.
If the page file exists, prioritize its rules.
If not, use the Master rules exclusively.
Now, generate the code...
```

---

Back to the [main README](../README.md).
