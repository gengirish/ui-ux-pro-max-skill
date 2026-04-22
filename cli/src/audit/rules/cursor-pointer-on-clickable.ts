import type { Violation } from '../types.js';

function lineAt(content: string, index: number): number {
  return content.slice(0, index).split('\n').length;
}

function hasCursorInAttrs(attrSegment: string): boolean {
  return /\bcursor-pointer\b/.test(attrSegment);
}

export function ruleCursorPointerOnClickable(content: string, _filePath: string): Violation[] {
  const out: Violation[] = [];
  const reButton = /<button\b([^>]*?)>/gi;
  let m: RegExpExecArray | null;
  while ((m = reButton.exec(content)) !== null) {
    const attrs = m[1];
    if (attrs && !hasCursorInAttrs(attrs)) {
      out.push({
        rule: 'cursor-pointer-on-clickable',
        severity: 'LOW',
        line: lineAt(content, m.index),
        message: '<button> should include cursor-pointer in class/className for consistent affordance',
        suggestion: 'Add `cursor-pointer` to the button classes',
      });
    }
  }

  const reA = /<a\s+[^>]*\bhref\s*=[^>]*?>/gi;
  while ((m = reA.exec(content)) !== null) {
    const full = m[0];
    if (!hasCursorInAttrs(full)) {
      out.push({
        rule: 'cursor-pointer-on-clickable',
        severity: 'LOW',
        line: lineAt(content, m.index),
        message: 'Link <a href> should include cursor-pointer in class/className',
        suggestion: 'Add `cursor-pointer` to the anchor classes',
      });
    }
  }

  // onClick on non-a / non-button (opening tag)
  const reOnClick = /<(\w+)\b([^>]*\bonClick\s*=)[^>]*?>/gi;
  while ((m = reOnClick.exec(content)) !== null) {
    const tag = m[1].toLowerCase();
    if (tag === 'a' || tag === 'button') continue;
    const full = m[0];
    if (!hasCursorInAttrs(full)) {
      out.push({
        rule: 'cursor-pointer-on-clickable',
        severity: 'LOW',
        line: lineAt(content, m.index),
        message: `Interactive <${tag}> (onClick) should include cursor-pointer in className/class`,
        suggestion: 'Add `cursor-pointer` for clickable non-button elements',
      });
    }
  }

  return out;
}
