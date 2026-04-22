/**
 * WCAG 2.1 relative luminance + contrast ratio, plus Tailwind v3 default palette (50–950).
 * Unknown `bg-` / `text-` tokens (arbitrary values, missing shade) are skipped.
 */

import type { Violation } from './types.js';

const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

// Tailwind v3 default colors (excerpt: full 50–950 for core scales used in generated UI)
const GRAY: Record<(typeof SHADES)[number], string> = {
  50: '#f9fafb',
  100: '#f3f4f6',
  200: '#e5e7eb',
  300: '#d1d5db',
  400: '#9ca3af',
  500: '#6b7280',
  600: '#4b5563',
  700: '#374151',
  800: '#1f2937',
  900: '#111827',
  950: '#030712',
};

const SLATE = {
  50: '#f8fafc',
  100: '#f1f5f9',
  200: '#e2e8f0',
  300: '#cbd5e1',
  400: '#94a3b8',
  500: '#64748b',
  600: '#475569',
  700: '#334155',
  800: '#1e293b',
  900: '#0f172a',
  950: '#020617',
} as const;

const ZINC = {
  50: '#fafafa',
  100: '#f4f4f5',
  200: '#e4e4e7',
  300: '#d4d4d8',
  400: '#a1a1aa',
  500: '#71717a',
  600: '#52525b',
  700: '#3f3f46',
  800: '#27272a',
  900: '#18181b',
  950: '#09090b',
} as const;

const NEUTRAL = {
  50: '#fafafa',
  100: '#f5f5f5',
  200: '#e5e5e5',
  300: '#d4d4d4',
  400: '#a3a3a3',
  500: '#737373',
  600: '#525252',
  700: '#404040',
  800: '#262626',
  900: '#171717',
  950: '#0a0a0a',
} as const;

const STONE = {
  50: '#fafaf9',
  100: '#f5f5f4',
  200: '#e7e5e4',
  300: '#d6d3d1',
  400: '#a8a29e',
  500: '#78716c',
  600: '#57534e',
  700: '#44403c',
  800: '#292524',
  900: '#1c1917',
  950: '#0c0a09',
} as const;

const RED = {
  50: '#fef2f2',
  100: '#fee2e2',
  200: '#fecaca',
  300: '#fca5a5',
  400: '#f87171',
  500: '#ef4444',
  600: '#dc2626',
  700: '#b91c1c',
  800: '#991b1b',
  900: '#7f1d1d',
  950: '#450a0a',
} as const;

const BLUE = {
  50: '#eff6ff',
  100: '#dbeafe',
  200: '#bfdbfe',
  300: '#93c5fd',
  400: '#60a5fa',
  500: '#3b82f6',
  600: '#2563eb',
  700: '#1d4ed8',
  800: '#1e40af',
  900: '#1e3a8a',
  950: '#172554',
} as const;

const GREEN = {
  50: '#f0fdf4',
  100: '#dcfce7',
  200: '#bbf7d0',
  300: '#86efac',
  400: '#4ade80',
  500: '#22c55e',
  600: '#16a34a',
  700: '#15803d',
  800: '#166534',
  900: '#14532d',
  950: '#052e16',
} as const;

const EMERALD = {
  50: '#ecfdf5',
  100: '#d1fae5',
  200: '#a7f3d0',
  300: '#6ee7b7',
  400: '#34d399',
  500: '#10b981',
  600: '#059669',
  700: '#047857',
  800: '#065f46',
  900: '#064e3b',
  950: '#022c22',
} as const;

const ORANGE = {
  50: '#fff7ed',
  100: '#ffedd5',
  200: '#fed7aa',
  300: '#fdba74',
  400: '#fb923c',
  500: '#f97316',
  600: '#ea580c',
  700: '#c2410c',
  800: '#9a3412',
  900: '#7c2d12',
  950: '#431407',
} as const;

const AMBER = {
  50: '#fffbeb',
  100: '#fef3c7',
  200: '#fde68a',
  300: '#fcd34d',
  400: '#fbbf24',
  500: '#f59e0b',
  600: '#d97706',
  700: '#b45309',
  800: '#92400e',
  900: '#78350f',
  950: '#451a03',
} as const;

const YELLOW = {
  50: '#fefce8',
  100: '#fef9c3',
  200: '#fef08a',
  300: '#fde047',
  400: '#facc15',
  500: '#eab308',
  600: '#ca8a04',
  700: '#a16207',
  800: '#854d0e',
  900: '#713f12',
  950: '#422006',
} as const;

const LIME = {
  50: '#f7fee7',
  100: '#ecfccb',
  200: '#d9f99d',
  300: '#bef264',
  400: '#a3e635',
  500: '#84cc16',
  600: '#65a30d',
  700: '#4d7c0f',
  800: '#3f6212',
  900: '#365314',
  950: '#1a2e05',
} as const;

const TEAL = {
  50: '#f0fdfa',
  100: '#ccfbf1',
  200: '#99f6e4',
  300: '#5eead4',
  400: '#2dd4bf',
  500: '#14b8a6',
  600: '#0d9488',
  700: '#0f766e',
  800: '#115e59',
  900: '#134e4a',
  950: '#042f2e',
} as const;

const CYAN = {
  50: '#ecfeff',
  100: '#cffafe',
  200: '#a5f3fc',
  300: '#67e8f9',
  400: '#22d3ee',
  500: '#06b6d4',
  600: '#0891b2',
  700: '#0e7490',
  800: '#155e75',
  900: '#164e63',
  950: '#083344',
} as const;

const SKY = {
  50: '#f0f9ff',
  100: '#e0f2fe',
  200: '#bae6fd',
  300: '#7dd3fc',
  400: '#38bdf8',
  500: '#0ea5e9',
  600: '#0284c7',
  700: '#0369a1',
  800: '#075985',
  900: '#0c4a6e',
  950: '#082f49',
} as const;

const INDIGO = {
  50: '#eef2ff',
  100: '#e0e7ff',
  200: '#c7d2fe',
  300: '#a5b4fc',
  400: '#818cf8',
  500: '#6366f1',
  600: '#4f46e5',
  700: '#4338ca',
  800: '#3730a3',
  900: '#312e81',
  950: '#1e1b4b',
} as const;

const VIOLET = {
  50: '#f5f3ff',
  100: '#ede9fe',
  200: '#ddd6fe',
  300: '#c4b5fd',
  400: '#a78bfa',
  500: '#8b5cf6',
  600: '#7c3aed',
  700: '#6d28d9',
  800: '#5b21b6',
  900: '#4c1d95',
  950: '#2e1065',
} as const;

const PURPLE = {
  50: '#faf5ff',
  100: '#f3e8ff',
  200: '#e9d5ff',
  300: '#d8b4fe',
  400: '#c084fc',
  500: '#a855f7',
  600: '#9333ea',
  700: '#7e22ce',
  800: '#6b21a8',
  900: '#581c87',
  950: '#3b0764',
} as const;

const FUCHSIA = {
  50: '#fdf4ff',
  100: '#fae8ff',
  200: '#f5d0fe',
  300: '#f0abfc',
  400: '#e879f9',
  500: '#d946ef',
  600: '#c026d3',
  700: '#a21caf',
  800: '#86198f',
  900: '#701a75',
  950: '#4a044e',
} as const;

const PINK = {
  50: '#fdf2f8',
  100: '#fce7f3',
  200: '#fbcfe8',
  300: '#f9a8d4',
  400: '#f472b6',
  500: '#ec4899',
  600: '#db2777',
  700: '#be185d',
  800: '#9d174d',
  900: '#831843',
  950: '#500724',
} as const;

const ROSE = {
  50: '#fff1f2',
  100: '#ffe4e6',
  200: '#fecdd3',
  300: '#fda4af',
  400: '#fb7185',
  500: '#f43f5e',
  600: '#e11d48',
  700: '#be123c',
  800: '#9f1239',
  900: '#881337',
  950: '#4c0519',
} as const;

export const TAILWIND_PALETTE: Readonly<Record<string, Readonly<Record<(typeof SHADES)[number], string>>>> = {
  gray: GRAY,
  slate: SLATE,
  zinc: ZINC,
  neutral: NEUTRAL,
  stone: STONE,
  red: RED,
  blue: BLUE,
  green: GREEN,
  emerald: EMERALD,
  orange: ORANGE,
  amber: AMBER,
  yellow: YELLOW,
  lime: LIME,
  teal: TEAL,
  cyan: CYAN,
  sky: SKY,
  indigo: INDIGO,
  violet: VIOLET,
  purple: PURPLE,
  fuchsia: FUCHSIA,
  pink: PINK,
  rose: ROSE,
} as const;

const SPECIAL: Record<string, string> = {
  white: '#ffffff',
  black: '#000000',
};

function srgbToLinear(c: number): number {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

export function parseHexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = hex.trim().match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return null;
  let s = m[1];
  if (s.length === 3) {
    s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
  }
  const n = parseInt(s, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function relativeLuminanceFromHex(hex: string): number | null {
  const rgb = parseHexToRgb(hex);
  if (!rgb) return null;
  const R = srgbToLinear(rgb.r);
  const G = srgbToLinear(rgb.g);
  const B = srgbToLinear(rgb.b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

export function contrastRatio(fg: string, bg: string): number | null {
  const l1 = relativeLuminanceFromHex(fg);
  const l2 = relativeLuminanceFromHex(bg);
  if (l1 === null || l2 === null) return null;
  const L1 = l1;
  const L2 = l2;
  const a = Math.max(L1, L2) + 0.05;
  const b = Math.min(L1, L2) + 0.05;
  return a / b;
}

type ShadeKey = (typeof SHADES)[number];

function getPaletteColor(family: string, shade: number): string | null {
  const p = TAILWIND_PALETTE[family];
  if (!p) return null;
  const k = shade as ShadeKey;
  if (!(k in p)) return null;
  return p[k] ?? null;
}

/**
 * Resolves a single utility token (e.g. `bg-gray-100`) to hex.
 */
function tokenToHex(token: string, role: 'bg' | 'text'): string | null {
  if (token.startsWith(`${role}-`)) {
    const rest = token.slice(role.length + 1);
    if (rest === 'white' || rest === 'black') {
      return SPECIAL[rest] ?? null;
    }
    const m = rest.match(
      new RegExp(`^([a-z]+)-(${SHADES.map(s => s.toString()).join('|')})$`)
    );
    if (!m) return null;
    return getPaletteColor(m[1], parseInt(m[2], 10));
  }
  return null;
}

/**
 * From a class string, pick last resolvable bg- and last resolvable text- and compare.
 */
function extractContrastingPair(classStr: string): { bg: string; text: string } | null {
  const parts = classStr.split(/\s+/);
  let bg: string | null = null;
  let text: string | null = null;
  for (const p of parts) {
    const tb = tokenToHex(p, 'bg');
    if (tb) bg = tb;
    const tt = tokenToHex(p, 'text');
    if (tt) text = tt;
  }
  if (!bg || !text) return null;
  return { bg, text };
}

function lineForIndex(content: string, index: number): number {
  return content.slice(0, index).split('\n').length;
}

export function ruleMinContrastWarning(content: string, _filePath: string): Violation[] {
  const out: Violation[] = [];
  // class / className / :class in quotes (single line primarily)
  const re =
    /(?:\bclass(?:Name)?\s*=\s*|:[a-z-]*\s*=\s*)(?:"([^"]+)"|'([^']+)'|`\s*([^`]+?)\s*`)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    const classStr = m[1] ?? m[2] ?? m[3];
    if (!classStr) continue;
    if (!/bg-/.test(classStr) || !/text-/.test(classStr)) continue;
    const pair = extractContrastingPair(classStr);
    if (!pair) continue;
    const ratio = contrastRatio(pair.text, pair.bg);
    if (ratio === null) continue;
    if (ratio < 4.5) {
      const line = lineForIndex(content, m.index);
      out.push({
        rule: 'min-contrast-warning',
        severity: 'HIGH',
        line,
        message: `Contrast ratio ${ratio.toFixed(2)}:1 is below WCAG AA 4.5:1 (bg + text)`,
        suggestion: 'Use higher-contrast `bg-` and `text-` shades or a border/hover state',
      });
    }
  }
  return out;
}
