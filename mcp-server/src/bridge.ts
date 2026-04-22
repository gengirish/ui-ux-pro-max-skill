import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

export type BridgeEnv = {
  repoRoot: string;
  searchScript: string;
};

/**
 * Resolves the repository root (parent of `mcp-server/`) and path to `search.py`.
 */
export function getBridgeEnv(): BridgeEnv {
  const srcDir = path.dirname(fileURLToPath(import.meta.url));
  const packageDir = path.resolve(srcDir, "..");
  const repoRoot = path.resolve(packageDir, "..");
  const searchScript = path.join(
    repoRoot,
    "src",
    "ui-ux-pro-max",
    "scripts",
    "search.py",
  );
  return { repoRoot, searchScript };
}

function resolvePython(): string {
  if (process.platform === "win32") {
    return "python";
  }
  return "python3";
}

export type RunSearchResult =
  | { ok: true; stdout: string; stderr: string }
  | { ok: false; code: string; message: string; hint?: string };

/**
 * Spawns `search.py` with the given argv (excluding python + script path).
 * Uses `repoRoot` as cwd so relative imports in Python resolve.
 */
export function runSearchScript(
  args: string[],
  env: BridgeEnv = getBridgeEnv(),
): Promise<RunSearchResult> {
  const py = resolvePython();
  return new Promise((resolve) => {
    const child = spawn(py, [env.searchScript, ...args], {
      cwd: env.repoRoot,
      windowsHide: true,
    });
    let stdout = "";
    let stderr = "";
    let settled = false;
    const done = (r: RunSearchResult) => {
      if (settled) {
        return;
      }
      settled = true;
      resolve(r);
    };
    child.stdout?.on("data", (d: Buffer) => {
      stdout += d.toString("utf-8");
    });
    child.stderr?.on("data", (d: Buffer) => {
      stderr += d.toString("utf-8");
    });
    child.on("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "ENOENT") {
        done({
          ok: false,
          code: "PYTHON_NOT_FOUND",
          message: `Could not run '${py}': not found on PATH`,
          hint: "Install Python 3 and ensure it is on PATH, then retry.",
        });
        return;
      }
      done({
        ok: false,
        code: "SPAWN_ERROR",
        message: err.message,
      });
    });
    child.on("close", (code) => {
      if (settled) {
        return;
      }
      if (code === 0) {
        done({ ok: true, stdout, stderr });
        return;
      }
      done({
        ok: false,
        code: "PYTHON_EXIT",
        message: `Python exited with code ${code}${stderr ? `: ${stderr.trim()}` : ""}`,
        hint:
          stderr || stdout
            ? undefined
            : "Ensure Python 3 and UI/UX Pro Max script dependencies are available.",
      });
    });
  });
}
