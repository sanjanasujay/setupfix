import type { Finding } from "../../types/diagnosis";

export function analyzeEnvironmentVariables(
  envExample: string,
  envVariables: string[]
): Finding | null {
  if (!envExample.trim()) {
    return null;
  }

  const requiredVariables = parseEnvExample(envExample);

  if (requiredVariables.length === 0) {
    return null;
  }

  const normalizedLocalVariables = envVariables
    .map((variable) => variable.trim())
    .filter(Boolean);

  const missingVariables = requiredVariables.filter(
    (variable) => !normalizedLocalVariables.includes(variable)
  );

  if (missingVariables.length === 0) {
    return null;
  }

  return {
    id: "missing-environment-variables",
    title: "Missing environment variables",
    description:
      "Your local environment is missing variables listed in .env.example.",
    severity: "blocker",
    category: "environment",

    evidence: missingVariables.map((variable) => ({
      source: "environment",
      label: "Missing variable",
      value: variable,
    })),

    fixes: [
      {
        description:
          "Add the missing variable names to your local .env or .env.local file.",
      },
    ],
  };
}

function parseEnvExample(envExample: string): string[] {
  return envExample
    .split("\n")
    .map((line) => line.trim())
    .filter(
      (line) =>
        line.length > 0 &&
        !line.startsWith("#") &&
        line.includes("=")
    )
    .map((line) => {
      const withoutExport = line.startsWith("export ")
        ? line.slice(7)
        : line;

      return withoutExport.split("=")[0].trim();
    })
    .filter(Boolean);
}