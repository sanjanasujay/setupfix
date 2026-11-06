import type { Finding } from "../../types/diagnosis";

export function analyzePackageManager(
  packageJson: string,
  command: string
): Finding | null {
  if (!packageJson.trim() || !command.trim()) {
    return null;
  }

  let parsedPackage;

  try {
    parsedPackage = JSON.parse(packageJson);
  } catch {
    return null;
  }

  const packageManager = parsedPackage?.packageManager;

  if (!packageManager) {
    return null;
  }

  const expectedManager = packageManager.split("@")[0];

  const normalizedCommand = command.trim().toLowerCase();

  let usedManager: string | null = null;

  if (normalizedCommand.startsWith("npm ")) {
    usedManager = "npm";
  } else if (normalizedCommand.startsWith("pnpm ")) {
    usedManager = "pnpm";
  } else if (normalizedCommand.startsWith("yarn ")) {
    usedManager = "yarn";
  } else if (normalizedCommand.startsWith("bun ")) {
    usedManager = "bun";
  }

  if (!usedManager) {
    return null;
  }

  if (usedManager === expectedManager) {
    return null;
  }

  return {
    id: "package-manager-mismatch",
    title: "Package manager mismatch",
    description: `This project expects ${expectedManager}, but the command uses ${usedManager}.`,
    severity: "warning",
    category: "configuration",

    evidence: [
      {
        source: "package.json",
        label: "Expected package manager",
        value: packageManager,
      },
      {
        source: "command",
        label: "Detected command",
        value: command,
      },
    ],

    fixes: [
      {
        description: `Use ${expectedManager} for this project.`,
        command: getSuggestedCommand(expectedManager, command),
      },
    ],
  };
}

function getSuggestedCommand(
  manager: string,
  command: string
): string {
  const normalized = command.trim();

  if (normalized.includes("run dev")) {
    return `${manager} run dev`;
  }

  if (
    normalized === "npm install" ||
    normalized === "pnpm install" ||
    normalized === "yarn install" ||
    normalized === "bun install"
  ) {
    return `${manager} install`;
  }

  return `${manager} install`;
}