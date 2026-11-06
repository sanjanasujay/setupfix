import { describe, expect, it } from "vitest";

import { analyzeNodeVersion } from "../lib/analyzer/node-version";
import { analyzeEnvironmentVariables } from "../lib/analyzer/env-check";
import { analyzePortConflict } from "../lib/analyzer/port-check";
import { analyzeCommand } from "../lib/analyzer/script-check";
import { analyzeDependencyError } from "../lib/analyzer/dependency-check";
import { analyzePackageManager } from "../lib/analyzer/package-manager-check";
import { analyzeProject } from "../lib/analyzer/analyze";

const packageJson = `{
  "name": "demo-store",
  "scripts": {
    "dev": "next dev",
    "build": "next build"
  },
  "engines": {
    "node": ">=20"
  },
  "dependencies": {
    "next": "15.5.0",
    "react": "19.1.0"
  }
}`;

describe("SetupFix diagnostic engine", () => {
  it("detects an incompatible Node version", () => {
    const finding = analyzeNodeVersion(
      packageJson,
      "18.20.4"
    );

    expect(finding).not.toBeNull();
    expect(finding?.id).toBe("node-version-mismatch");
    expect(finding?.severity).toBe("blocker");
  });

  it("accepts a compatible Node version", () => {
    const finding = analyzeNodeVersion(
      packageJson,
      "20.10.0"
    );

    expect(finding).toBeNull();
  });

  it("detects missing environment variables", () => {
    const envExample = `DATABASE_URL=
NEXT_PUBLIC_API_URL=
OPENAI_API_KEY=`;

    const finding = analyzeEnvironmentVariables(
      envExample,
      ["DATABASE_URL", "NEXT_PUBLIC_API_URL"]
    );

    expect(finding).not.toBeNull();
    expect(finding?.id).toBe(
      "missing-environment-variables"
    );

    expect(
      finding?.evidence.some(
        (evidence) =>
          evidence.value === "OPENAI_API_KEY"
      )
    ).toBe(true);
  });

  it("ignores comments in .env.example", () => {
    const envExample = `# Database
DATABASE_URL=

# Public API
NEXT_PUBLIC_API_URL=`;

    const finding = analyzeEnvironmentVariables(
      envExample,
      ["DATABASE_URL", "NEXT_PUBLIC_API_URL"]
    );

    expect(finding).toBeNull();
  });

  it("detects a port conflict", () => {
    const finding = analyzePortConflict(
      "Error: listen EADDRINUSE: address already in use :::3000"
    );

    expect(finding).not.toBeNull();
    expect(finding?.id).toBe("port-conflict");

    expect(
      finding?.evidence[0].value
    ).toContain("3000");
  });

  it("detects an undefined npm script", () => {
    const finding = analyzeCommand(
      packageJson,
      "npm run start-dev"
    );

    expect(finding).not.toBeNull();
    expect(finding?.id).toBe("missing-script");

    expect(
      finding?.fixes.some(
        (fix) => fix.command === "npm run dev"
      )
    ).toBe(true);
  });

  it("accepts an existing npm script", () => {
    const finding = analyzeCommand(
      packageJson,
      "npm run dev"
    );

    expect(finding).toBeNull();
  });

  it("detects an undeclared dependency", () => {
    const finding = analyzeDependencyError(
      packageJson,
      "Module not found: Can't resolve 'axios'"
    );

    expect(finding).not.toBeNull();
    expect(finding?.id).toBe(
      "undeclared-dependency"
    );

    expect(finding?.fixes[0].command).toBe(
      "npm install axios"
    );
  });

  it("detects package manager mismatch", () => {
    const pnpmPackage = `{
      "name": "demo-store",
      "packageManager": "pnpm@10.0.0",
      "scripts": {
        "dev": "next dev"
      }
    }`;

    const finding = analyzePackageManager(
      pnpmPackage,
      "npm run dev"
    );

    expect(finding).not.toBeNull();
    expect(finding?.id).toBe(
      "package-manager-mismatch"
    );

    expect(finding?.fixes[0].command).toBe(
      "pnpm run dev"
    );
  });

  it("returns a healthy result when all checks pass", () => {
    const result = analyzeProject({
      packageJson,
      envExample: `DATABASE_URL=
NEXT_PUBLIC_API_URL=`,
      nodeVersion: "20.10.0",

      envVariables: [
        "DATABASE_URL",
        "NEXT_PUBLIC_API_URL",
      ],

      command: "npm run dev",

      terminalOutput: `> next dev
Ready in 842ms`,
    });

    expect(result.findings).toHaveLength(0);
    expect(result.score).toBe(100);
    expect(result.status).toBe("healthy");
  });

  it("combines multiple independent setup problems", () => {
    const result = analyzeProject({
      packageJson,
      envExample: `DATABASE_URL=
OPENAI_API_KEY=`,

      nodeVersion: "18.20.4",

      envVariables: [
        "DATABASE_URL",
      ],

      command: "npm run dev",

      terminalOutput:
        "Error: listen EADDRINUSE: address already in use :::3000",
    });

    const ids = result.findings.map(
      (finding) => finding.id
    );

    expect(ids).toContain(
      "node-version-mismatch"
    );

    expect(ids).toContain(
      "missing-environment-variables"
    );

    expect(ids).toContain(
      "port-conflict"
    );

    expect(result.status).toBe("blocked");
  });
});