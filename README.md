# UI UX Pro Max

> Stop your AI from generating purple-gradient slop. Ship on-brand, accessible,
> conversion-shaped UI on the first try.

<p align="center">
  <a href="https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/releases"><img src="https://img.shields.io/github/v/release/nextlevelbuilder/ui-ux-pro-max-skill?style=for-the-badge&amp;color=blue" alt="GitHub Release"></a>
  <a href="https://www.npmjs.com/package/uipro-cli"><img src="https://img.shields.io/npm/v/uipro-cli?style=flat-square&amp;logo=npm&amp;label=CLI" alt="npm"></a>
  <a href="https://www.npmjs.com/package/uipro-cli"><img src="https://img.shields.io/npm/dm/uipro-cli?style=flat-square&amp;label=downloads" alt="npm downloads"></a>
  <a href="https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/stargazers"><img src="https://img.shields.io/github/stars/nextlevelbuilder/ui-ux-pro-max-skill?style=flat-square&amp;logo=github" alt="GitHub stars"></a>
  <a href="https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/blob/main/LICENSE"><img src="https://img.shields.io/github/license/nextlevelbuilder/ui-ux-pro-max-skill?style=flat-square&amp;color=green" alt="License"></a>
  <a href="https://paypal.me/uiuxpromax"><img src="https://img.shields.io/badge/PayPal-Support%20Development-00457C?style=flat-square&amp;logo=paypal&amp;logoColor=white" alt="PayPal"></a>
</p>

[UI UX Pro Max](https://uupm.cc) is an AI skill that turns your AI coding assistant into a senior
designer. Instead of letting Claude, Cursor, or Copilot reach for the same purple
gradient on every prompt, it constrains output to a complete, industry-appropriate
design system: pattern, style, palette, typography, motion, and the anti-patterns
to avoid.

68k devs ship faster with it.

## See it in action

<!-- TODO: capture before/after screenshots -->

<table>
  <thead>
    <tr>
      <th>Before</th>
      <th>After</th>
      <th>Context</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><img src="screenshots/before-spa.png" alt="Before: beauty spa landing" width="280" /></td>
      <td><img src="screenshots/after-spa.png" alt="After: beauty spa landing" width="280" /></td>
      <td>Beauty spa landing. Same prompt, same model, with vs without UI UX Pro Max.</td>
    </tr>
    <tr>
      <td><img src="screenshots/before-fintech.png" alt="Before: fintech dashboard" width="280" /></td>
      <td><img src="screenshots/after-fintech.png" alt="After: fintech dashboard" width="280" /></td>
      <td>Fintech dashboard. Same prompt, same model, with vs without UI UX Pro Max.</td>
    </tr>
    <tr>
      <td><img src="screenshots/before-portfolio.png" alt="Before: design portfolio" width="280" /></td>
      <td><img src="screenshots/after-portfolio.png" alt="After: design portfolio" width="280" /></td>
      <td>Design portfolio. Same prompt, same model, with vs without UI UX Pro Max.</td>
    </tr>
  </tbody>
</table>

Files live under `screenshots/`; see [screenshots/README.md](screenshots/README.md) for the checklist.

## Quick start

Most people run:

```bash
npm install -g uipro-cli
uipro init
```

`uipro init` auto-detects your AI host (Claude Code, Cursor, Windsurf, and many others). If you need to pin a host, pass `--ai` with a flag from the groups below. Full table (global install, Marketplace, prerequisites, example prompts) is in [docs/install.md](docs/install.md).

<details>
<summary>MCP-native (recommended)</summary>

```bash
uipro init --ai claude     # Claude Code
uipro init --ai cursor     # Cursor
uipro init --ai windsurf   # Windsurf
uipro init --ai continue   # Continue
uipro init --ai codex      # Codex CLI
uipro init --ai roocode    # Roo Code
uipro init --ai kilocode   # KiloCode
uipro init --ai opencode   # OpenCode
uipro init --ai augment    # Augment
```

</details>

<details>
<summary>Skill-file install</summary>

```bash
uipro init --ai kiro        # Kiro
uipro init --ai copilot     # GitHub Copilot
uipro init --ai trae        # Trae
uipro init --ai antigravity # Antigravity
uipro init --ai qoder       # Qoder
uipro init --ai codebuddy   # CodeBuddy
uipro init --ai droid       # Droid (Factory)
uipro init --ai warp        # Warp
uipro init --ai gemini      # Gemini CLI
uipro init --ai all         # all supported assistants
```

</details>

You need **Python 3.x** for the local search script. One-line checks and install hints: [docs/install.md#prerequisites](docs/install.md#prerequisites).

### After you install

Most hosts use **skill mode**: ask for a UI in plain language and the pack activates. Kiro, Copilot, Roo Code, and Kilo can use the **`/ui-ux-pro-max ...`** workflow instead. If you are on **Trae**, switch to **SOLO** mode first, then make your UI request.

For stack-specific guidance, name your stack in the prompt, or read the supported list in [docs/install.md#supported-stacks](docs/install.md#supported-stacks). Default is HTML and Tailwind when you do not specify one.

**Claude Code** can also install from the Marketplace. See the two `/plugin` lines in [docs/install.md#claude-marketplace-claude-code](docs/install.md#claude-marketplace-claude-code).

## What it does

Three concrete guarantees:

1. **Right pattern for the industry.** A beauty spa gets Soft UI Evolution, warm
   pastels, and Cormorant Garamond. A fintech dashboard gets Glassmorphism, trust
   blue, and Inter. A B2B SaaS gets hero, features, and a clear CTA, not a
   twelve-section storytelling maximalist sprawl.
2. **Anti-patterns blocked.** No purple-pink AI gradients on a banking app. No
   emoji-as-icons. No 12px body copy. No hover-only affordances. No
   dark-mode-by-default for a wellness brand.
3. **Accessible by default.** Every recommendation ships with WCAG AA targets,
   focus-state requirements, and a pre-delivery checklist your AI is expected to
   self-check before returning code.

## How it works (60 seconds)

```text
user prompt
  -> industry classifier (per-industry rules)
  -> multi-domain retrieval (style + palette + typography + landing)
  -> reasoning engine (apply rules, filter anti-patterns)
  -> complete design system
  -> your AI host writes the code
```

## Example

Sample output for a spa product (v2.0 design system format):

<details>
<summary>Serenity Spa (ASCII design system block)</summary>

```text
+----------------------------------------------------------------------------------------+
|  TARGET: Serenity Spa - RECOMMENDED DESIGN SYSTEM                                      |
+----------------------------------------------------------------------------------------+
|                                                                                        |
|  PATTERN: Hero-Centric + Social Proof                                                  |
|     Conversion: Emotion-driven with trust elements                                     |
|     CTA: Above fold, repeated after testimonials                                       |
|     Sections:                                                                          |
|       1. Hero                                                                          |
|       2. Services                                                                      |
|       3. Testimonials                                                                  |
|       4. Booking                                                                       |
|       5. Contact                                                                       |
|                                                                                        |
|  STYLE: Soft UI Evolution                                                              |
|     Keywords: Soft shadows, subtle depth, calming, premium feel, organic shapes        |
|     Best For: Wellness, beauty, lifestyle brands, premium services                     |
|     Performance: Excellent | Accessibility: WCAG AA                                    |
|                                                                                        |
|  COLORS:                                                                               |
|     Primary:    #E8B4B8 (Soft Pink)                                                    |
|     Secondary:  #A8D5BA (Sage Green)                                                   |
|     CTA:        #D4AF37 (Gold)                                                         |
|     Background: #FFF5F5 (Warm White)                                                   |
|     Text:       #2D3436 (Charcoal)                                                     |
|     Notes: Calming palette with gold accents for luxury feel                           |
|                                                                                        |
|  TYPOGRAPHY: Cormorant Garamond / Montserrat                                           |
|     Mood: Elegant, calming, sophisticated                                              |
|     Best For: Luxury brands, wellness, beauty, editorial                               |
|     Google Fonts: https://fonts.google.com/share?selection.family=...                  |
|                                                                                        |
|  KEY EFFECTS:                                                                          |
|     Soft shadows + Smooth transitions (200-300ms) + Gentle hover states                |
|                                                                                        |
|  AVOID (Anti-patterns):                                                                |
|     Bright neon colors + Harsh animations + Dark mode + AI purple/pink gradients       |
|                                                                                        |
|  PRE-DELIVERY CHECKLIST:                                                               |
|     [ ] No emojis as icons (use SVG: Heroicons/Lucide)                                 |
|     [ ] cursor-pointer on all clickable elements                                       |
|     [ ] Hover states with smooth transitions (150-300ms)                               |
|     [ ] Light mode: text contrast 4.5:1 minimum                                        |
|     [ ] Focus states visible for keyboard nav                                          |
|     [ ] prefers-reduced-motion respected                                               |
|     [ ] Responsive: 375px, 768px, 1024px, 1440px                                       |
|                                                                                        |
+----------------------------------------------------------------------------------------+
```

</details>

v2.0 introduced this **Design System Generator** flow (reasoning engine plus optional persistence). See [docs/advanced.md](docs/advanced.md) for Master + Overrides and raw `search.py` usage.

## What's inside

| Knowledge base | Count | Source |
| --- | ---: | --- |
| Industry reasoning rules | 161 | `data/ui-reasoning.csv` |
| UI styles | 67 | `data/styles.csv` |
| Color palettes | 161 | `data/colors.csv` |
| Font pairings | 57 | `data/typography.csv` |
| UX guidelines | 99 | `data/ux-guidelines.csv` |
| Chart types | 25 | `data/charts.csv` |
| Tech stacks | 15 | `data/stacks/*.csv` |

Paths are relative to `src/ui-ux-pro-max/` in this repository.

Want the full taxonomy? See [docs/catalog.md](docs/catalog.md).

## Documentation map

| Document | When to use it |
| --- | --- |
| [docs/install.md](docs/install.md) | Install, host flags, `uipro` subcommands, stacks |
| [docs/catalog.md](docs/catalog.md) | Full style, landing, and dashboard tables |
| [docs/advanced.md](docs/advanced.md) | `search.py` design-system run, Master + Overrides |
| [docs/architecture.md](docs/architecture.md) | Contribution flow, `src/` vs `cli/`, local CLI test |

## Advanced usage

Run `search.py` yourself for ASCII or Markdown design systems, domain-only searches, or stack-tagged guidance. You can also persist a **Master + Overrides** tree under `design-system/` so sessions re-read a single source of truth.

- Continue and Droid users: path swaps in the examples (`.continue/skills/`, `.factory/skills/`).
- Full commands, copy-paste prompts, and the hierarchical retrieval text live in [docs/advanced.md](docs/advanced.md).

Contributor-facing notes on `src/` vs `cli/` and template generation: [docs/architecture.md](docs/architecture.md).

## Contributing

Open issues are triaged weekly. PRs from forks are welcome; start from [CONTRIBUTING.md](CONTRIBUTING.md). The `evals/` suite gates merges when present.

## Funding

If this skill saves you time, you can [support development on PayPal](https://paypal.me/uiuxpromax).

**Other projects:** [NextLevelBuilder.io](https://nextlevelbuilder.io) · [GoClaw.sh](https://goclaw.sh) · [ClaudeKit.cc](https://claudekit.cc) · [TOSE.sh](https://tose.sh)

## License

This project is licensed under the [MIT License](LICENSE).

## Star history

[![Star History Chart](https://api.star-history.com/svg?repos=nextlevelbuilder/ui-ux-pro-max-skill&type=Date)](https://star-history.com/#nextlevelbuilder/ui-ux-pro-max-skill&Date)
