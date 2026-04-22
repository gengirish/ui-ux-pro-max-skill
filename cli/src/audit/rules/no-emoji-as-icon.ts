import type { Violation } from '../types.js';

/** Broad emoji + pictographic ranges (UAX #51 style). */
const EMOJI_IN_TEXT =
  /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{1F900}-\u{1F9FF}]/u;

function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, ' ');
}

function lineAt(content: string, index: number): number {
  return content.slice(0, index).split('\n').length;
}

export function ruleNoEmojiAsIcon(content: string, _filePath: string): Violation[] {
  const out: Violation[] = [];
  // Interactive: button, a with href, span with onClick
  const openButton = /<button\b[^>]*>/gi;
  let m: RegExpExecArray | null;
  while ((m = openButton.exec(content)) !== null) {
    const openEnd = m.index + m[0].length;
    const close = findClosingTag(content, 'button', openEnd);
    if (close < 0) continue;
    const inner = content.slice(openEnd, close);
    if (EMOJI_IN_TEXT.test(stripTags(inner))) {
      out.push({
        rule: 'no-emoji-as-icon',
        severity: 'MEDIUM',
        line: lineAt(content, m.index),
        message: '<button> contains emoji in content; use an icon or SVG for affordance',
        suggestion: 'Replace emoji with an accessible icon component or inline SVG',
      });
    }
  }

  const openA = /<a\s[^>]*\bhref\s*=/gi;
  while ((m = openA.exec(content)) !== null) {
    const gt = content.indexOf('>', m.index);
    if (gt < 0) continue;
    const openEnd = gt + 1;
    const close = findClosingTag(content, 'a', openEnd);
    if (close < 0) continue;
    const inner = content.slice(openEnd, close);
    if (EMOJI_IN_TEXT.test(stripTags(inner))) {
      out.push({
        rule: 'no-emoji-as-icon',
        severity: 'MEDIUM',
        line: lineAt(content, m.index),
        message: 'Interactive <a> contains emoji in content',
        suggestion: 'Use an icon or text label without emoji for links',
      });
    }
  }

  const openSpan = /<span[^>]*\bonClick\s*=[^>]*>/gi;
  while ((m = openSpan.exec(content)) !== null) {
    const gt = content.indexOf('>', m.index);
    if (gt < 0) continue;
    const openEnd = gt + 1;
    const close = findClosingTag(content, 'span', openEnd);
    if (close < 0) continue;
    const inner = content.slice(openEnd, close);
    if (EMOJI_IN_TEXT.test(stripTags(inner))) {
      out.push({
        rule: 'no-emoji-as-icon',
        severity: 'MEDIUM',
        line: lineAt(content, m.index),
        message: 'Clickable <span> contains emoji in content',
        suggestion: 'Use a <button> with an icon or proper aria-label',
      });
    }
  }

  return out;
}

function findClosingTag(content: string, tag: string, from: number): number {
  const reOpen = new RegExp(`<${tag}\\b[^>]*>`, 'gi');
  const reClose = new RegExp(`</${tag}\\s*>`, 'gi');
  let depth = 1;
  let pos = from;
  while (depth > 0) {
    reOpen.lastIndex = pos;
    reClose.lastIndex = pos;
    const nextOpen = reOpen.exec(content);
    const nextClose = reClose.exec(content);
    if (!nextClose) return -1;
    const oi = nextOpen ? nextOpen.index : Number.POSITIVE_INFINITY;
    const ci = nextClose.index;
    if (nextOpen && oi < ci) {
      depth++;
      pos = oi + nextOpen[0].length;
    } else {
      depth--;
      if (depth === 0) return ci;
      pos = ci + nextClose[0].length;
    }
  }
  return -1;
}
