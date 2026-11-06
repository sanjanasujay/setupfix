import type { Finding } from "../../types/diagnosis";

export function analyzeCommand(
  packageJson: string,
  command: string
): Finding | null {
  if (!command.trim()) {
    return null;
  }

  let parsedPackage;

  try {
    parsedPackage = JSON.parse(packageJson);
  } catch {
    return null;
  }

  const scripts = parsedPackage?.scripts ?? {};

  const match = command.trim().match(/^npm run ([\w:-]+)$/);

  if (!match) {
    return null;
  }

  const requestedScript = match[1];

  if (scripts[requestedScript]) {
    return null;
  }

  const availableScripts = Object.keys(scripts);

  return {
    id: "missing-script",
    title: "Command references an undefined npm script",
    description: `The script "${requestedScript}" is not defined in package.json.`,
    severity: "blocker",
    category: "script",

    evidence: [
      {
        source: "command",
        label: "Command entered",
        value: command,
      },
      {
        source: "package.json",
        label: "Available scripts",
        value:
          availableScripts.length > 0
            ? availableScripts.join(", ")
            : "No scripts defined",
      },
    ],

    fixes: availableScripts.includes("dev")
      ? [
          {
            description: 'This project defines a "dev" script.',
            command: "npm run dev",
          },
        ]
      : [
          {
            description:
              "Use one of the scripts defined in package.json.",
          },
        ],
  };
}