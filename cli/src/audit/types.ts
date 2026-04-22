export type Severity = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Violation {
  rule: string;
  severity: Severity;
  line: number;
  message: string;
  suggestion?: string;
}

export const SEVERITY_RANK: Record<Severity, number> = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
};

export function meetsMinSeverity(violation: Violation, min: Severity): boolean {
  return SEVERITY_RANK[violation.severity] >= SEVERITY_RANK[min];
}
