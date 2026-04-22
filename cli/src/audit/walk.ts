import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

const IGNORE = new Set(['node_modules', '.next', 'dist', 'build']);
const FILE_EXT = /\.(html|jsx|tsx|vue|svelte|astro)$/i;

export async function collectUiFiles(rootDir: string): Promise<string[]> {
  const out: string[] = [];
  await walkDir(rootDir, out);
  return out.sort();
}

async function walkDir(dir: string, out: string[]): Promise<void> {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    if (e.isDirectory() && IGNORE.has(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      await walkDir(p, out);
    } else if (FILE_EXT.test(e.name)) {
      out.push(p);
    }
  }
}
