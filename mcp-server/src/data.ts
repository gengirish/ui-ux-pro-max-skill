import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export type CsvRow = Record<string, string>;

const srcDir = path.dirname(fileURLToPath(import.meta.url));
const packageDir = path.resolve(srcDir, "..");

let stylesCache: CsvRow[] | null = null;
let colorsCache: CsvRow[] | null = null;

/**
 * CSV line parser (handles `"` doubled quotes, commas inside quotes).
 * Assumes one record per line (matches repo CSVs).
 */
function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i]!;
    if (c === '"') {
      if (inQ && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQ = !inQ;
      }
    } else if (c === "," && !inQ) {
      out.push(cur);
      cur = "";
    } else {
      cur += c;
    }
  }
  out.push(cur);
  return out;
}

function readCsvFile(filePath: string): CsvRow[] {
  const text = fs.readFileSync(filePath, "utf-8");
  const lines = text.split(/\r?\n/).filter((l) => l.length > 0);
  if (lines.length < 2) {
    return [];
  }
  const header = parseCsvLine(lines[0]!);
  const rows: CsvRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]!);
    const row: CsvRow = {};
    for (let j = 0; j < header.length; j++) {
      row[header[j]!] = values[j] ?? "";
    }
    rows.push(row);
  }
  return rows;
}

export function resolveDataDir(): string {
  if (process.env["UIPRO_DATA_DIR"]?.length) {
    return path.resolve(process.env["UIPRO_DATA_DIR"]!);
  }
  const repoData = path.join(
    path.resolve(packageDir, ".."),
    "src",
    "ui-ux-pro-max",
    "data",
  );
  if (fs.existsSync(path.join(repoData, "styles.csv"))) {
    return repoData;
  }
  return path.join(packageDir, "assets", "data");
}

export function loadDataCaches(): void {
  const dataDir = resolveDataDir();
  const stylesPath = path.join(dataDir, "styles.csv");
  const colorsPath = path.join(dataDir, "colors.csv");
  if (!fs.existsSync(stylesPath) || !fs.existsSync(colorsPath)) {
    stylesCache = [];
    colorsCache = [];
    return;
  }
  stylesCache = readCsvFile(stylesPath);
  colorsCache = readCsvFile(colorsPath);
}

export function getStyleRows(): CsvRow[] {
  if (!stylesCache) {
    loadDataCaches();
  }
  return stylesCache ?? [];
}

export function getColorRows(): CsvRow[] {
  if (!colorsCache) {
    loadDataCaches();
  }
  return colorsCache ?? [];
}

function rowId(row: CsvRow): number {
  const n = Number.parseInt(String(row["No"] ?? ""), 10);
  return Number.isFinite(n) ? n : -1;
}

export function getStyleById(id: number): CsvRow | null {
  const rows = getStyleRows();
  return rows.find((r) => rowId(r) === id) ?? null;
}

export function getColorById(id: number): CsvRow | null {
  const rows = getColorRows();
  return rows.find((r) => rowId(r) === id) ?? null;
}

export function listStyleIds(): number[] {
  return getStyleRows()
    .map((r) => rowId(r))
    .filter((n) => n >= 1);
}

export function listColorIds(): number[] {
  return getColorRows()
    .map((r) => rowId(r))
    .filter((n) => n >= 1);
}
