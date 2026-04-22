import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { Command } from 'commander';
import chalk from 'chalk';
import {
  getTelemetryConfigPath,
  loadTelemetryConfig,
  saveTelemetryConfig,
} from '../utils/telemetry.js';
import { detectAIType } from '../utils/detect.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, '..', '..', 'package.json'), 'utf-8')) as {
  version: string;
};

function industryBucketForCwd(_cwd: string = process.cwd()): string {
  // Deliberately coarse; real pipeline will bucket with design-system metadata.
  return 'saas';
}

export function registerTelemetryCommand(program: Command): void {
  const tel = program
    .command('telemetry')
    .description('Manage local opt-in anonymous telemetry preferences (no network in this build)');

  tel
    .command('status')
    .description('Show current telemetry opt-in and config path')
    .action(async () => {
      const c = await loadTelemetryConfig();
      const path = getTelemetryConfigPath();
      console.log(
        c.enabled
          ? chalk.green('Telemetry: enabled (anonymous)')
          : chalk.dim('Telemetry: disabled')
      );
      console.log(chalk.dim(`Config: ${path}`));
      if (c.anonymousId) {
        console.log(chalk.dim(`anonymousId: ${c.anonymousId}`));
      }
      if (c.consentDate) {
        console.log(chalk.dim(`consentDate: ${c.consentDate}`));
      }
    });

  tel
    .command('enable')
    .description('Opt in to anonymous telemetry; generates a local anonymousId')
    .action(async () => {
      const id = randomUUID();
      const consentDate = new Date().toISOString();
      await saveTelemetryConfig({ enabled: true, anonymousId: id, consentDate });
      console.log(chalk.green('Telemetry enabled. Anonymous id stored under ~/.config/uipro/'));
    });

  tel
    .command('disable')
    .description('Opt out and remove stored anonymousId')
    .action(async () => {
      await saveTelemetryConfig({ enabled: false });
      console.log(chalk.yellow('Telemetry disabled; anonymousId removed if present.'));
    });

  tel
    .command('preview')
    .description('Show a sample payload that would be sent (for transparency)')
    .action(async () => {
      const c = await loadTelemetryConfig();
      const { detected } = detectAIType();
      const aiHost = detected[0] ?? 'unknown';
      const sample = {
        event: 'design_system_generated',
        anonymousId: c.anonymousId ?? '(not set — run `uipro telemetry enable`)',
        version: pkg.version,
        ai_host: aiHost,
        industry_bucket: industryBucketForCwd(),
        duration_ms: 2310,
        ts: new Date().toISOString(),
      };
      console.log(JSON.stringify(sample, null, 2));
      console.log();
      // TODO: Wire HTTP POST to telemetry endpoint in a follow-up PR (see cli/README).
      console.log(
        chalk.dim('Note: this CLI does not send HTTP requests yet; endpoint lands in a follow-up.')
      );
    });
}
