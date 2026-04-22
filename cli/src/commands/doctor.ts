import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import chalk from 'chalk';
import { detectAIType, getAITypeDescription } from '../utils/detect.js';
import { loadTelemetryConfig } from '../utils/telemetry.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, '..', '..', 'package.json'), 'utf-8')) as {
  version: string;
};

type Status = 'ok' | 'warn' | 'fail';

interface Line {
  status: Status;
  label: string;
  detail?: string;
}

function mark(s: Status, label: string, detail?: string): Line {
  return { status: s, label, detail };
}

function lineStr(l: Line): string {
  const p =
    l.status === 'ok'
      ? '[OK]  '
      : l.status === 'warn'
        ? '[WARN] '
        : '[FAIL] ';
  const d = l.detail ? chalk.dim(` — ${l.detail}`) : '';
  return `${p}${l.label}${d}`;
}

const SKILL_CANDIDATES: string[][] = [
  ['.claude', 'skills', 'ui-ux-pro-max'],
  ['.cursor', 'skills', 'ui-ux-pro-max'],
  ['.windsurf', 'skills', 'ui-ux-pro-max'],
  ['.agents', 'skills', 'ui-ux-pro-max'],
  ['.github', 'prompts', 'ui-ux-pro-max'],
  ['.roo', 'skills', 'ui-ux-pro-max'],
  ['.kiro', 'steering', 'ui-ux-pro-max'],
  ['.codex', 'skills', 'ui-ux-pro-max'],
  ['.qoder', 'skills', 'ui-ux-pro-max'],
  ['.gemini', 'skills', 'ui-ux-pro-max'],
  ['.trae', 'skills', 'ui-ux-pro-max'],
  ['.opencode', 'skills', 'ui-ux-pro-max'],
  ['.continue', 'skills', 'ui-ux-pro-max'],
  ['.codebuddy', 'skills', 'ui-ux-pro-max'],
  ['.factory', 'skills', 'ui-ux-pro-max'],
  ['.kilocode', 'skills', 'ui-ux-pro-max'],
  ['.warp', 'skills', 'ui-ux-pro-max'],
  ['.augment', 'skills', 'ui-ux-pro-max'],
];

function hasPython3(): { ok: boolean; cmd?: string; note?: string } {
  for (const [cmd, args] of [
    ['python3', ['--version']],
    ['python', ['--version']],
    ['py', ['-3', '--version']],
  ] as [string, string[]][]) {
    const r = spawnSync(cmd, args, { encoding: 'utf-8' });
    if (r.status === 0 && (r.stdout + r.stderr).match(/(?:Python\s*3|3\.\d)/)) {
      return { ok: true, cmd };
    }
  }
  return { ok: false, note: 'not found on PATH' };
}

function findSkillRoot(cwd: string): string | null {
  for (const segs of SKILL_CANDIDATES) {
    const p = join(cwd, ...segs);
    if (existsSync(p)) return p;
  }
  return null;
}

export async function doctorCommand(): Promise<void> {
  const lines: Line[] = [];
  const cwd = process.cwd();
  let hasFail = false;

  const major = Number.parseInt(process.versions.node?.split('.')[0] ?? '0', 10);
  if (Number.isNaN(major) || major < 18) {
    lines.push(mark('fail', 'Node', `need v18+ (have ${process.version})`));
    hasFail = true;
  } else {
    lines.push(mark('ok', 'Node', process.version));
  }

  const py = hasPython3();
  if (py.ok) {
    lines.push(
      mark('ok', 'Python 3 on PATH', `found via ${py.cmd} (optional for some future workflows)`)
    );
  } else {
    lines.push(
      mark('warn', 'Python 3 on PATH', 'not on PATH; optional — install if you use skill Python scripts')
    );
  }

  const { detected } = detectAIType(cwd);
  if (detected.length) {
    lines.push(
      mark('ok', 'AI host markers in cwd', detected.map(t => getAITypeDescription(t)).join('; '))
    );
  } else {
    lines.push(
      mark(
        'warn',
        'AI host markers in cwd',
        'no .cursor/.claude/.windsurf/… in this directory'
      )
    );
  }

  const foundSkill = findSkillRoot(cwd);
  if (foundSkill) {
    lines.push(mark('ok', 'UI/UX Pro Max skill', foundSkill));
  } else {
    lines.push(
      mark(
        'warn',
        'UI/UX Pro Max skill',
        'no known skills/…/ui-ux-pro-max path (run uipro init)'
      )
    );
  }

  if (py.ok) {
    const searchPy = foundSkill
      ? join(foundSkill, 'scripts', 'search.py')
      : join(cwd, '.claude', 'skills', 'ui-ux-pro-max', 'scripts', 'search.py');
    if (existsSync(searchPy)) {
      const cmd = py.cmd ?? 'python3';
      const r = spawnSync(cmd, [searchPy, '--help'], { encoding: 'utf-8', timeout: 12_000 });
      const out = (r.stdout ?? '') + (r.stderr ?? '');
      if (r.status === 0 || /usage|argparse|search|optional arguments/i.test(out)) {
        lines.push(mark('ok', 'search.py', `${cmd} search.py --help`));
      } else {
        lines.push(
          mark('warn', 'search.py', `exit code ${r.status} (script present at ${searchPy})`)
        );
      }
    } else {
      lines.push(
        mark('warn', 'search.py', `not at ${searchPy}`)
      );
    }
  } else {
    lines.push(
      mark(
        'warn',
        'search.py --help',
        'Python not on PATH; skipped (install Python 3 to verify scripts)'
      )
    );
  }

  const tel = await loadTelemetryConfig();
  lines.push(
    mark('ok', 'Telemetry', tel.enabled ? 'enabled' : 'disabled (uipro telemetry status)')
  );

  lines.push(
    mark('ok', 'CLI version (installed)', `${pkg.version} (npm "latest" check in a follow-up)`)
  );

  console.log(chalk.bold.cyan('\nUI/UX Pro Max — environment check\n'));
  for (const l of lines) {
    console.log(lineStr(l));
  }
  console.log();
  if (hasFail) process.exit(1);
}
