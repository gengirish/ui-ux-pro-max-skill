import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import chalk from 'chalk';
import type { Severity } from '../audit/types.js';
import { meetsMinSeverity, type Violation } from '../audit/types.js';
import { collectUiFiles } from '../audit/walk.js';
import { runRulesOnFile } from '../audit/run.js';

export interface AuditOptions {
  path?: string;
  json?: boolean;
  severity?: Severity;
}

function parseSeverity(s: string | undefined): Severity {
  if (s == null || s === '') return 'LOW';
  if (s === 'LOW' || s === 'MEDIUM' || s === 'HIGH') return s;
  console.error(`Invalid --severity: ${s} (use LOW, MEDIUM, or HIGH)`);
  process.exit(2);
  return 'LOW';
}

function groupByFile(violations: { file: string; v: Violation }[]): Map<string, Violation[]> {
  const m = new Map<string, Violation[]>();
  for (const { file, v } of violations) {
    const ar = m.get(file) ?? [];
    ar.push(v);
    m.set(file, ar);
  }
  return m;
}

export async function auditCommand(options: AuditOptions): Promise<void> {
  const root = resolve(options.path ?? '.');
  const min = parseSeverity(options.severity);
  const files = await collectUiFiles(root);
  const withSev: { file: string; v: Violation }[] = [];
  let anyHigh = false;

  for (const file of files) {
    let content: string;
    try {
      content = await readFile(file, 'utf-8');
    } catch {
      continue;
    }
    for (const v of runRulesOnFile(file, content)) {
      if (v.severity === 'HIGH') anyHigh = true;
      if (meetsMinSeverity(v, min)) {
        withSev.push({ file, v });
      }
    }
  }

  if (options.json) {
    const byFile: Record<string, Violation[]> = {};
    for (const { file, v } of withSev) {
      if (!byFile[file]) byFile[file] = [];
      byFile[file]!.push(v);
    }
    const summary = { LOW: 0, MEDIUM: 0, HIGH: 0 };
    for (const { v } of withSev) {
      summary[v.severity]++;
    }
    console.log(
      JSON.stringify(
        { root, files: byFile, summary, total: withSev.length },
        null,
        2
      )
    );
  } else {
    if (withSev.length === 0) {
      console.log(chalk.green('No violations in scanned files.'));
    } else {
      const g = groupByFile(withSev);
      for (const [file, list] of [...g.entries()].sort((a, b) =>
        a[0].localeCompare(b[0])
      )) {
        console.log(chalk.bold.cyan(`\n${file}`));
        for (const v of list.sort((a, b) => a.line - b.line)) {
          const sev =
            v.severity === 'HIGH'
              ? chalk.red(v.severity)
              : v.severity === 'MEDIUM'
                ? chalk.yellow(v.severity)
                : chalk.blue(v.severity);
          const line = chalk.dim(`L${v.line}`);
          console.log(`  ${sev} ${line}  ${v.rule}: ${v.message}`);
          if (v.suggestion) {
            console.log(chalk.dim(`         → ${v.suggestion}`));
          }
        }
      }
    }
    const summary = { LOW: 0, MEDIUM: 0, HIGH: 0 };
    for (const { v } of withSev) {
      summary[v.severity]++;
    }
    console.log();
    console.log(
      chalk.bold(
        `Summary: ${summary.LOW} LOW, ${summary.MEDIUM} MEDIUM, ${summary.HIGH} HIGH (total ${withSev.length})`
      )
    );
  }

  if (anyHigh) {
    process.exit(1);
  }
}
