import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';

const CONFIG_DIR = join(homedir(), '.config', 'uipro');
const TELEMETRY_FILE = join(CONFIG_DIR, 'telemetry.json');

export interface TelemetryConfig {
  enabled: boolean;
  anonymousId?: string;
  consentDate?: string;
}

const DEFAULT_CONFIG: TelemetryConfig = { enabled: false };

/**
 * Read telemetry preferences from `~/.config/uipro/telemetry.json`.
 * Missing or invalid file → `{ enabled: false }`.
 */
export async function loadTelemetryConfig(): Promise<TelemetryConfig> {
  try {
    const raw = await readFile(TELEMETRY_FILE, 'utf-8');
    const j = JSON.parse(raw) as unknown;
    if (j && typeof j === 'object' && 'enabled' in j) {
      const o = j as Record<string, unknown>;
      return {
        enabled: Boolean(o.enabled),
        anonymousId: typeof o.anonymousId === 'string' ? o.anonymousId : undefined,
        consentDate: typeof o.consentDate === 'string' ? o.consentDate : undefined,
      };
    }
  } catch {
    /* missing / parse error */
  }
  return { ...DEFAULT_CONFIG };
}

/**
 * Write telemetry preferences (creates `~/.config/uipro` as needed).
 */
export async function saveTelemetryConfig(config: TelemetryConfig): Promise<void> {
  await mkdir(CONFIG_DIR, { recursive: true });
  const out = {
    enabled: config.enabled,
    ...(config.anonymousId ? { anonymousId: config.anonymousId } : {}),
    ...(config.consentDate ? { consentDate: config.consentDate } : {}),
  };
  await writeFile(TELEMETRY_FILE, JSON.stringify(out, null, 2) + '\n', 'utf-8');
}

export function isTelemetryEnabled(config: TelemetryConfig | null | undefined): boolean {
  return Boolean(config?.enabled);
}

export function getTelemetryConfigPath(): string {
  return TELEMETRY_FILE;
}
