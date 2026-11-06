import type { Finding } from "../../types/diagnosis";

export function analyzeDependencyError(
  packageJson: string,
  terminalOutput: string
): Finding | null {
  if (!terminalOutput.trim()) {
    return null;
  }

  let parsedPackage;

  try {
    parsedPackage = JSON.parse(packageJson);
  } catch {
    return null;
  }

  const modulePatterns = [
    /Cannot find module ['"]([^'"]+)['"]/i,
    /Can't resolve ['"]([^'"]+)['"]/i,
    /Module not found.*['"]([^'"]+)['"]/i,
  ];

  let missingModule: string | null = null;

  for (const pattern of modulePatterns) {
    const match = terminalOutput.match(pattern);

    if (match) {
      missingModule = match[1];
      break;
    }
  }

  if (!missingModule) {
    return null;
  }

  const packageName = getPackageName(missingModule);

  const dependencies = {
    ...(parsedPackage.dependencies ?? {}),
    ...(parsedPackage.devDependencies ?? {}),
  };

  const isDeclared = Boolean(dependencies[packageName]);

  if (isDeclared) {
    return {
      id: "declared-dependency-missing",
      title: "Installed dependency may be missing",
      description: `"${packageName}" is listed in package.json, but the runtime could not resolve it.`,
      severity: "blocker",
      category: "dependency",

      evidence: [
        {
          source: "terminal",
          label: "Missing module",
          value: missingModule,
        },
        {
          source: "package.json",
          label: "Declared dependency",
          value: packageName,
        },
      ],

      fixes: [
        {
          description:
            "Reinstall project dependencies to restore missing packages.",
          command: "npm install",
        },
      ],
    };
  }

  return {
    id: "undeclared-dependency",
    title: "Dependency is not declared",
    description: `"${packageName}" could not be resolved and is not listed in package.json.`,
    severity: "blocker",
    category: "dependency",

    evidence: [
      {
        source: "terminal",
        label: "Missing module",
        value: missingModule,
      },
      {
        source: "package.json",
        label: "Dependency status",
        value: `${packageName} is not declared`,
      },
    ],

    fixes: [
      {
        description: `Install "${packageName}" and add it to the project dependencies.`,
        command: `npm install ${packageName}`,
      },
    ],
  };
}

function getPackageName(modulePath: string): string {
  if (modulePath.startsWith("@")) {
    return modulePath.split("/").slice(0, 2).join("/");
  }

  return modulePath.split("/")[0];
}