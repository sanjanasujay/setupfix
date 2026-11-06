export type Severity = "blocker" | "warning" | "info";

export type EvidenceSource =
  | "package.json"
  | "terminal"
  | "environment"
  | "command";


export interface DiagnosisInput {
  packageJson: string;
  envExample: string;
  nodeVersion: string;
  envVariables: string[];
  terminalOutput: string;
  command?: string;
}

export interface Evidence {
  source: EvidenceSource;
  label: string;
  value: string;
}

export interface SuggestedFix {
  description: string;
  command?: string;
}

export interface Finding {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  category:
    | "runtime"
    | "environment"
    | "dependency"
    | "script"
    | "port"
    | "configuration";

  evidence: Evidence[];
  fixes: SuggestedFix[];
}

export interface PassedCheck {
  id: string;
  label: string;
}

export interface DiagnosisResult {
  score: number;

  status:
    | "healthy"
    | "needs-attention"
    | "blocked";

  findings: Finding[];
  passedChecks: PassedCheck[];
}