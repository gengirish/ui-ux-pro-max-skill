import type { Violation } from './types.js';
import { ruleNoEmojiAsIcon } from './rules/no-emoji-as-icon.js';
import { ruleCursorPointerOnClickable } from './rules/cursor-pointer-on-clickable.js';
import { ruleNoFixedPixelFonts } from './rules/no-fixed-pixel-fonts.js';
import { ruleNoAiPurpleGradient } from './rules/no-ai-purple-gradient.js';
import { ruleFocusStateRequired } from './rules/focus-state-required.js';
import { ruleMinContrastWarning } from './contrast.js';

const RULES: Array<(content: string, filePath: string) => Violation[]> = [
  ruleNoEmojiAsIcon,
  ruleCursorPointerOnClickable,
  ruleNoFixedPixelFonts,
  ruleNoAiPurpleGradient,
  ruleFocusStateRequired,
  ruleMinContrastWarning,
];

export function runRulesOnFile(filePath: string, content: string): Violation[] {
  const all: Violation[] = [];
  for (const r of RULES) {
    all.push(...r(content, filePath));
  }
  return all;
}
