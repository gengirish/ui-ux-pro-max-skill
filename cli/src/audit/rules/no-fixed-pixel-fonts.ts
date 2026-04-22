import type { Violation } from '../types.js';

export function ruleNoFixedPixelFonts(content: string, _filePath: string): Violation[] {
  const out: Violation[] = [];
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    if (/font-size\s*:\s*\d+px/.test(line) || /fontSize\s*:\s*['"]?\d+px/.test(line)) {
      out.push({
        rule: 'no-fixed-pixel-fonts',
        severity: 'MEDIUM',
        line: i + 1,
        message: 'Fixed pixel font size in inline style; prefer rem or theme scale for accessibility',
        suggestion: 'Use rem, Tailwind text-sm/text-base, or text-[0.75rem] instead of px',
      });
    }
    if (/text-\[\d+px\]/g.test(line)) {
      out.push({
        rule: 'no-fixed-pixel-fonts',
        severity: 'MEDIUM',
        line: i + 1,
        message: 'Tailwind arbitrary `text-[Npx]`; prefer `rem` or the default type scale',
        suggestion: 'Replace with text-sm, text-base, or text-[0.875rem] etc.',
      });
    }
  }
  return out;
}
