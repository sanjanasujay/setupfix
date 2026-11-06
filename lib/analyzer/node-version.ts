import type { Finding } from "../../types/diagnosis";

export function analyzeNodeVersion(
  packageJson: string,
  currentVersion: string
): Finding | null {
  let parsedPackage;

  try {
    parsedPackage = JSON.parse(packageJson);
  } catch {
    return {
      id: "invalid-package-json",
      title: "Invalid package.json",
      description:
        "SetupFix could not parse your package.json. Check the JSON syntax and try again.",
      severity: "blocker",
      category: "configuration",
      evidence: [
        {
          source: "package.json",
          label: "Parse result",
          value: "Invalid JSON",
        },
      ],
      fixes: [
        {
          description: "Fix the package.json syntax before continuing.",
        },
      ],
    };
  }

  const requiredVersion = parsedPackage?.engines?.node;

  if (!requiredVersion || !currentVersion.trim()) {
    return null;
  }

  const currentMajor = Number(
    currentVersion.replace(/^v/, "").split(".")[0]
  );

  const match = requiredVersion.match(/>=\s*(\d+)/);

  if (!match) {
    return null;
  }

  const requiredMajor = Number(match[1]);

  if (currentMajor >= requiredMajor) {
    return null;
  }

  return {
    id: "node-version-mismatch",
    title: "Node version mismatch",
    description:
      "Your local Node.js version does not satisfy the minimum version required by this project.",
    severity: "blocker",
    category: "runtime",

    evidence: [
      {
        source: "environment",
        label: "Current Node version",
        value: currentVersion,
      },
      {
        source: "package.json",
        label: "Required Node version",
        value: requiredVersion,
      },
    ],

    fixes: [
      {
        description: `Install Node.js ${requiredMajor}.`,
        command: `nvm install ${requiredMajor}`,
      },
      {
        description: `Switch to Node.js ${requiredMajor}.`,
        command: `nvm use ${requiredMajor}`,
      },
    ],
  };
}