import type { Finding } from "../../types/diagnosis";

export function analyzePortConflict(
  terminalOutput: string
): Finding | null {
  if (!terminalOutput.trim()) {
    return null;
  }

  const hasPortConflict =
    terminalOutput.includes("EADDRINUSE") ||
    terminalOutput.toLowerCase().includes("address already in use");

  if (!hasPortConflict) {
    return null;
  }

  const portMatch = terminalOutput.match(/(?:::{1}|:)(\d{2,5})/);

  const port = portMatch ? portMatch[1] : "unknown";

  return {
    id: "port-conflict",
    title: "Port already in use",
    description:
      port === "unknown"
        ? "The application is trying to use a port that is already occupied by another process."
        : `Port ${port} is already being used by another process.`,
    severity: "warning",
    category: "port",

    evidence: [
      {
        source: "terminal",
        label: "Detected error",
        value:
          terminalOutput
            .split("\n")
            .find(
              (line) =>
                line.includes("EADDRINUSE") ||
                line.toLowerCase().includes("address already in use")
            ) ?? "Address already in use",
      },
    ],

    fixes: [
      ...(port !== "unknown"
        ? [
            {
              description: `Find the process currently using port ${port}.`,
              command: `lsof -i :${port}`,
            },
            {
              description: "Or run the development server on another port.",
              command: `npm run dev -- -p ${Number(port) + 1}`,
            },
          ]
        : [
            {
              description:
                "Find the process using the required application port and stop it, or run the project on another port.",
            },
          ]),
    ],
  };
}