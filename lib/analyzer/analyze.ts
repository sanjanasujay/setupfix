import type {
  DiagnosisInput,
  DiagnosisResult,
  Finding,
  PassedCheck,
} from "../../types/diagnosis";

import { analyzeNodeVersion } from "./node-version";
import { analyzePortConflict } from "./port-check";
import { analyzeEnvironmentVariables } from "./env-check";
import { analyzeCommand } from "./script-check";
import { analyzeDependencyError } from "./dependency-check";
import { analyzePackageManager } from "./package-manager-check";

export function analyzeProject(
  input: DiagnosisInput
): DiagnosisResult {
  const findings: Finding[] = [];

  const nodeFinding = analyzeNodeVersion(
    input.packageJson,
    input.nodeVersion
  );

  if (nodeFinding) {
    findings.push(nodeFinding);
  }

  const portFinding = analyzePortConflict(
    input.terminalOutput
  );

  if (portFinding) {
    findings.push(portFinding);
  }

  const envFinding = analyzeEnvironmentVariables(
    input.envExample,
    input.envVariables
  );

  if (envFinding) {
    findings.push(envFinding);
  }

  const commandFinding = analyzeCommand(
    input.packageJson,
    input.command ?? ""
  );

  if (commandFinding) {
    findings.push(commandFinding);
  }

  const dependencyFinding = analyzeDependencyError(
    input.packageJson,
    input.terminalOutput
  );

  if (dependencyFinding) {
    findings.push(dependencyFinding);
  }
const packageManagerFinding = analyzePackageManager(
  input.packageJson,
  input.command ?? ""
);

if (packageManagerFinding) {
  findings.push(packageManagerFinding);
}
  const passedChecks = buildPassedChecks(input, findings);

  const blockerCount = findings.filter(
    (finding) => finding.severity === "blocker"
  ).length;

  const warningCount = findings.filter(
    (finding) => finding.severity === "warning"
  ).length;

  const infoCount = findings.filter(
    (finding) => finding.severity === "info"
  ).length;

  const score = Math.max(
    0,
    100 -
      blockerCount * 25 -
      warningCount * 10 -
      infoCount * 5
  );

  let status: DiagnosisResult["status"] = "healthy";

  if (blockerCount > 0) {
    status = "blocked";
  } else if (warningCount > 0) {
    status = "needs-attention";
  }

  return {
    score,
    status,
    findings,
    passedChecks,
  };
}

function buildPassedChecks(
  input: DiagnosisInput,
  findings: Finding[]
): PassedCheck[] {
  const passed: PassedCheck[] = [];

  const hasFinding = (id: string) =>
    findings.some((finding) => finding.id === id);

  const packageJsonValid = isValidJson(input.packageJson);

  if (packageJsonValid) {
    passed.push({
      id: "package-json-valid",
      label: "package.json parsed successfully",
    });
  }

  if (
    packageJsonValid &&
    input.nodeVersion.trim() &&
    !hasFinding("node-version-mismatch")
  ) {
    passed.push({
      id: "node-version-compatible",
      label: "Node.js version is compatible",
    });
  }

  if (
    input.envExample.trim() &&
    !hasFinding("missing-environment-variables")
  ) {
    passed.push({
      id: "environment-complete",
      label: "Required environment variables are present",
    });
  }

  if (
    input.command?.trim() &&
    !hasFinding("missing-script")
  ) {
    passed.push({
      id: "command-valid",
      label: "Requested npm script exists",
    });
  }

  if (
    input.terminalOutput.trim() &&
    !hasFinding("port-conflict")
  ) {
    passed.push({
      id: "port-available",
      label: "No port conflict detected",
    });
  }

  if (
    input.terminalOutput.trim() &&
    !hasFinding("declared-dependency-missing") &&
    !hasFinding("undeclared-dependency")
  ) {
    passed.push({
      id: "dependencies-resolvable",
      label: "No missing dependency error detected",
    });
  }
if (packageJsonValid) {
  const parsedPackage = JSON.parse(input.packageJson);

  if (
    parsedPackage.packageManager &&
    input.command?.trim() &&
    !hasFinding("package-manager-mismatch")
  ) {
    passed.push({
      id: "package-manager-compatible",
      label: "Package manager matches project configuration",
    });
  }
}
  return passed;
}

function isValidJson(value: string): boolean {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}