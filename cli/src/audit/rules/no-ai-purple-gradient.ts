import type { Violation } from '../types.js';

function lineAt(content: string, index: number): number {
  return content.slice(0, index).split('\n').length;
}

const HEX_PURPLE = /#a855f7/i;
const HEX_PINK = /#ec4899/i;

export function ruleNoAiPurpleGradient(content: string, _filePath: string): Violation[] {
  const out: Violation[] = [];
  // Tailwind: from-purple- + to-pink- in same attribute-ish chunk
  const reAttr =
    /(?:\bclass(?:Name)?\s*=\s*|class\s*=\s*)(?:"([^"]+)"|'([^']+)'|`\s*([^`]+?)\s*`)/g;
  let m: RegExpExecArray | null;
  while ((m = reAttr.exec(content)) !== null) {
    const s = m[1] ?? m[2] ?? m[3] ?? '';
    if (/\bfrom-purple-/.test(s) && /\bto-pink-/.test(s)) {
      out.push({
        rule: 'no-ai-purple-gradient',
        severity: 'HIGH',
        line: lineAt(content, m.index),
        message: 'Common AI “purple to pink” gradient; avoid the generic from-purple- / to-pink- pairing',
        suggestion: 'Pick a more distinctive gradient or a solid token from your design system',
      });
    }
  }
  // Hex pair (common Tailwind 500s) in close proximity
  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    if (HEX_PURPLE.test(line) && HEX_PINK.test(line)) {
      const ip = line.search(HEX_PURPLE);
      const ik = line.search(HEX_PINK);
      if (ip >= 0 && ik >= 0 && Math.abs(ip - ik) <= 120) {
        out.push({
          rule: 'no-ai-purple-gradient',
          severity: 'HIGH',
          line: i + 1,
          message: 'Adjacent purple/pink brand hexes (#a855f7 + #ec4899) read as “AI slop” gradient',
          suggestion: 'Use a palette token or different hue stops from your design system',
        });
      }
    }
  }
  return out;
}
