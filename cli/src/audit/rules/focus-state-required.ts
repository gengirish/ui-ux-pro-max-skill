import type { Violation } from '../types.js';

function lineAt(content: string, index: number): number {
  return content.slice(0, index).split('\n').length;
}

/**
 * True if the opening tag provides visible focus (Tailwind or inline :focus in style).
 */
function hasFocusStyle(attrs: string): boolean {
  if (
    /(?:^|[\s"'`{[\,])focus-visible:/.test(attrs) ||
    /(?:^|[\s"'`{[\,])focus-within:/.test(attrs) ||
    /(?:^|[\s"'`{[\,])focus:/.test(attrs)
  ) {
    return true;
  }
  if (/style=\{/.test(attrs)) {
    if (/[:\-]focus['"}\]]/.test(attrs) || /:focus/.test(attrs)) return true;
  }
  if (/\bstyle="[^"]*:focus/.test(attrs) || /\bstyle='[^']*:focus/.test(attrs)) {
    return true;
  }
  return false;
}

export function ruleFocusStateRequired(content: string, _filePath: string): Violation[] {
  const out: Violation[] = [];
  const re = /<(button|a)\b([^>]*?)>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    const tag = m[1].toLowerCase();
    const attrs = m[2] ?? '';
    if (tag === 'a' && !/\bhref\s*=/.test(attrs)) continue; // not a real link
    if (!hasFocusStyle(attrs)) {
      out.push({
        rule: 'focus-state-required',
        severity: 'HIGH',
        line: lineAt(content, m.index),
        message: `<${tag}> missing visible :focus / focus: / focus-visible: / focus-within: styles`,
        suggestion: 'Add e.g. focus:outline-none focus:ring-2 or focus-visible:ring',
      });
    }
  }
  return out;
}
