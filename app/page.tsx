"use client";

import { useState } from "react";
import { sampleProjects } from "../data/sample-project";
import type { DiagnosisResult } from "../types/diagnosis";
import { analyzeProject } from "../lib/analyzer/analyze";

export default function Home() {
  const [packageJson, setPackageJson] = useState("");
  const [envExample, setEnvExample] = useState("");
  const [nodeVersion, setNodeVersion] = useState("");
  const [envVariables, setEnvVariables] = useState("");
  const [command, setCommand] = useState("");
  const [terminalOutput, setTerminalOutput] = useState("");

  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
  const [result, setResult] = useState<DiagnosisResult | null>(null);

  function loadExample(exampleKey: string) {
    const sample = sampleProjects[exampleKey];

    if (!sample) {
      return;
    }

    setPackageJson(sample.packageJson);
    setEnvExample(sample.envExample);
    setNodeVersion(sample.nodeVersion);
    setEnvVariables(sample.envVariables.join(", "));
    setCommand(sample.command ?? "");
    setTerminalOutput(sample.terminalOutput);

    // Clear previous diagnosis when loading another scenario.
    setResult(null);
  }

  function diagnoseSetup() {
    const parsedEnvVariables = envVariables
      .split(",")
      .map((variable) => variable.trim())
      .filter(Boolean);

    const diagnosis = analyzeProject({
      packageJson,
      envExample,
      nodeVersion,
      envVariables: parsedEnvVariables,
      command,
      terminalOutput,
    });

    setResult(diagnosis);
  }

  async function copyCommand(commandToCopy: string) {
    try {
      await navigator.clipboard.writeText(commandToCopy);

      setCopiedCommand(commandToCopy);

      setTimeout(() => {
        setCopiedCommand(null);
      }, 1500);
    } catch {
      setCopiedCommand(null);
    }
  }

  const blockerCount =
    result?.findings.filter(
      (finding) => finding.severity === "blocker"
    ).length ?? 0;

  const warningCount =
    result?.findings.filter(
      (finding) => finding.severity === "warning"
    ).length ?? 0;

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#09090b] text-white">
      {/* Navigation */}
      <nav className="w-full border-b border-white/10">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white font-bold text-black">
              S
            </div>

            <div className="min-w-0">
              <p className="truncate font-semibold">
                SetupFix
              </p>

              <p className="truncate text-xs text-zinc-500">
                Local environment diagnostics
              </p>
            </div>
          </div>

          <div className="hidden shrink-0 text-sm text-zinc-400 sm:block">
            Node.js projects
          </div>
        </div>
      </nav>

      <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
        {/* Hero */}
        <div className="mb-10 max-w-3xl sm:mb-12">
          <div className="mb-5 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-zinc-300 sm:text-sm">
            Developer setup diagnostics
          </div>

          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Stop debugging your setup.

            <span className="block text-zinc-500">
              Start debugging your code.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg sm:leading-8">
            SetupFix analyzes your project configuration and terminal output to
            identify common local development problems and recommend concrete
            fixes.
          </p>
        </div>

        {/* Diagnostic form */}
        <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#111113] shadow-2xl sm:rounded-3xl">
          <div className="border-b border-white/10 px-5 py-5 sm:px-7 sm:py-6">
            <h2 className="text-xl font-semibold">
              Diagnose project setup
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              Paste project metadata and the error you encountered.
            </p>
          </div>

          <div className="grid min-w-0 gap-6 p-5 sm:p-7 lg:grid-cols-2">
            {/* package.json */}
            <div className="min-w-0 lg:col-span-2">
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                package.json
              </label>

              <textarea
                value={packageJson}
                onChange={(e) => setPackageJson(e.target.value)}
                placeholder={`{
  "scripts": {
    "dev": "next dev"
  },
  "engines": {
    "node": ">=20"
  }
}`}
                className="min-h-56 w-full min-w-0 max-w-full resize-y rounded-2xl border border-white/10 bg-black/40 p-4 font-mono text-sm leading-6 text-zinc-200 outline-none transition placeholder:text-zinc-700 focus:border-white/30"
              />
            </div>

            {/* .env.example */}
            <div className="min-w-0 lg:col-span-2">
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                .env.example
              </label>

              <textarea
                value={envExample}
                onChange={(e) => setEnvExample(e.target.value)}
                placeholder={`DATABASE_URL=
NEXT_PUBLIC_API_URL=
OPENAI_API_KEY=`}
                className="min-h-36 w-full min-w-0 max-w-full resize-y rounded-2xl border border-white/10 bg-black/40 p-4 font-mono text-sm leading-6 text-zinc-200 outline-none transition placeholder:text-zinc-700 focus:border-white/30"
              />

              <p className="mt-2 text-xs leading-5 text-zinc-600">
                Paste variable names from .env.example. Never paste real secret
                values.
              </p>
            </div>

            {/* Node version */}
            <div className="min-w-0">
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Local Node version
              </label>

              <input
                value={nodeVersion}
                onChange={(e) => setNodeVersion(e.target.value)}
                placeholder="20.10.0"
                className="w-full min-w-0 max-w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm outline-none transition placeholder:text-zinc-700 focus:border-white/30"
              />
            </div>

            {/* Command */}
            <div className="min-w-0">
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Command
              </label>

              <input
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="npm run dev"
                className="w-full min-w-0 max-w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 font-mono text-sm outline-none transition placeholder:text-zinc-700 focus:border-white/30"
              />
            </div>

            {/* Environment variables */}
            <div className="min-w-0 lg:col-span-2">
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Local environment variable names
              </label>

              <input
                value={envVariables}
                onChange={(e) => setEnvVariables(e.target.value)}
                placeholder="DATABASE_URL, NEXT_PUBLIC_API_URL"
                className="w-full min-w-0 max-w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 font-mono text-sm outline-none transition placeholder:text-zinc-700 focus:border-white/30"
              />

              <p className="mt-2 text-xs leading-5 text-zinc-600">
                Enter variable names only. Never paste secret values.
              </p>
            </div>

            {/* Terminal output */}
            <div className="min-w-0 lg:col-span-2">
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Terminal output
              </label>

              <textarea
                value={terminalOutput}
                onChange={(e) => setTerminalOutput(e.target.value)}
                placeholder="Paste the terminal error here..."
                className="min-h-44 w-full min-w-0 max-w-full resize-y rounded-2xl border border-white/10 bg-black/40 p-4 font-mono text-sm leading-6 text-zinc-200 outline-none transition placeholder:text-zinc-700 focus:border-white/30"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-white/10 p-5 sm:p-7">
            <div className="flex min-w-0 flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-300">
                  Try an example
                </p>

                <p className="mt-1 text-xs leading-5 text-zinc-600">
                  Load a realistic setup failure to see how SetupFix diagnoses
                  it.
                </p>

                <div className="mt-4 flex max-w-full flex-wrap gap-2">
                  <ExampleButton
                    label="Node mismatch"
                    onClick={() => loadExample("node-mismatch")}
                  />

                  <ExampleButton
                    label="Missing env"
                    onClick={() => loadExample("missing-env")}
                  />

                  <ExampleButton
                    label="Dependency error"
                    onClick={() => loadExample("dependency-error")}
                  />

                  <ExampleButton
                    label="Bad command"
                    onClick={() => loadExample("bad-command")}
                  />

                  <ExampleButton
                    label="Port conflict"
                    onClick={() => loadExample("port-conflict")}
                  />

                  <ExampleButton
                    label="Package manager"
                    onClick={() => loadExample("package-manager")}
                  />
                </div>
              </div>

              <button
                onClick={diagnoseSetup}
                className="w-full shrink-0 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 lg:w-auto"
              >
                Diagnose setup →
              </button>
            </div>
          </div>
        </div>

        {/* Results dashboard */}
        {result && (
          <section className="mt-8 w-full min-w-0 sm:mt-10">
            <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#111113] sm:rounded-3xl">
              {/* Health summary */}
              <div className="grid min-w-0 gap-8 border-b border-white/10 p-5 sm:p-7 lg:grid-cols-[220px_minmax(0,1fr)]">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-zinc-500">
                    Setup health
                  </p>

                  <div className="mt-3 flex items-end gap-2">
                    <span className="text-5xl font-semibold tracking-tight sm:text-6xl">
                      {result.score}
                    </span>

                    <span className="mb-2 text-lg text-zinc-600">
                      / 100
                    </span>
                  </div>

                  <p className="mt-3 text-sm capitalize text-zinc-400">
                    {result.status.replace("-", " ")}
                  </p>
                </div>

                <div className="grid min-w-0 gap-3 sm:grid-cols-3">
                  <SummaryCard
                    label="Blockers"
                    value={blockerCount}
                    description="Must resolve"
                  />

                  <SummaryCard
                    label="Warnings"
                    value={warningCount}
                    description="Needs attention"
                  />

                  <SummaryCard
                    label="Passed"
                    value={result.passedChecks.length}
                    description="Checks successful"
                  />
                </div>
              </div>

              {/* Passed checks */}
              {result.passedChecks.length > 0 && (
                <div className="border-b border-white/10 p-5 sm:p-7">
                  <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">
                    Passed checks
                  </p>

                  <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2">
                    {result.passedChecks.map((check) => (
                      <div
                        key={check.id}
                        className="flex min-w-0 items-center gap-3 rounded-xl border border-emerald-500/10 bg-emerald-500/[0.04] px-4 py-3"
                      >
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-xs text-emerald-300">
                          ✓
                        </div>

                        <p className="min-w-0 break-words text-sm text-zinc-300">
                          {check.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Findings */}
              {result.findings.length > 0 ? (
                <div className="min-w-0 p-5 sm:p-7">
                  <div className="mb-5">
                    <p className="text-sm font-medium text-zinc-500">
                      Diagnostic findings
                    </p>

                    <h2 className="mt-1 text-xl font-semibold sm:text-2xl">
                      {result.findings.length} issue
                      {result.findings.length !== 1 ? "s" : ""} found
                    </h2>
                  </div>

                  <div className="min-w-0 space-y-4">
                    {result.findings.map((finding) => {
                      const isBlocker =
                        finding.severity === "blocker";

                      const cardStyle = isBlocker
                        ? "border-red-500/20 bg-red-500/[0.04]"
                        : "border-amber-500/20 bg-amber-500/[0.04]";

                      const badgeStyle = isBlocker
                        ? "border-red-500/30 bg-red-500/10 text-red-300"
                        : "border-amber-500/30 bg-amber-500/10 text-amber-300";

                      return (
                        <div
                          key={finding.id}
                          className={`min-w-0 rounded-2xl border p-5 sm:p-6 ${cardStyle}`}
                        >
                          <span
                            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${badgeStyle}`}
                          >
                            {finding.severity}
                          </span>

                          <h3 className="mt-4 break-words text-lg font-semibold sm:text-xl">
                            {finding.title}
                          </h3>

                          <p className="mt-2 max-w-2xl break-words text-sm leading-6 text-zinc-400">
                            {finding.description}
                          </p>

                          {/* Evidence */}
                          {finding.evidence.length > 0 && (
                            <div className="mt-6 grid min-w-0 gap-3 sm:grid-cols-2">
                              {finding.evidence.map((evidence) => (
                                <div
                                  key={`${evidence.source}-${evidence.label}-${evidence.value}`}
                                  className="min-w-0 overflow-hidden rounded-xl border border-white/10 bg-black/30 p-4"
                                >
                                  <p className="text-xs text-zinc-600">
                                    {evidence.label}
                                  </p>

                                  <p className="mt-1 break-words font-mono text-sm leading-6 text-zinc-200">
                                    {evidence.value}
                                  </p>

                                  <p className="mt-2 text-xs text-zinc-600">
                                    Source: {evidence.source}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Recommended fixes */}
                          {finding.fixes.length > 0 && (
                            <div className="mt-6 min-w-0">
                              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-zinc-500">
                                Recommended fix
                              </p>

                              <div className="min-w-0 space-y-3">
                                {finding.fixes.map((fix, index) => (
                                  <div
                                    key={index}
                                    className="min-w-0 overflow-hidden rounded-xl border border-white/10 bg-black/40 p-4"
                                  >
                                    <p className="break-words text-sm leading-6 text-zinc-400">
                                      {fix.description}
                                    </p>

                                    {fix.command && (
                                      <div className="mt-3 flex min-w-0 max-w-full items-center gap-3 rounded-lg border border-white/10 bg-black/40 px-3 py-2">
                                        <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap font-mono text-xs text-zinc-200 sm:text-sm">
                                          $ {fix.command}
                                        </code>

                                        <button
                                          onClick={() =>
                                            copyCommand(fix.command!)
                                          }
                                          className="shrink-0 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:bg-white/5 hover:text-white"
                                        >
                                          {copiedCommand === fix.command
                                            ? "Copied ✓"
                                            : "Copy"}
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-5 sm:p-7">
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-5 sm:p-6">
                    <p className="text-sm font-semibold text-emerald-300">
                      No setup issues detected
                    </p>

                    <h3 className="mt-2 text-lg font-semibold sm:text-xl">
                      Your configuration passed all implemented checks.
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-zinc-400">
                      SetupFix did not identify any blockers or warnings from
                      the supplied project information.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Process cards */}
        <div className="mt-8 grid min-w-0 gap-4 sm:grid-cols-3">
          <InfoCard
            number="01"
            title="Inspect"
            description="Parse project configuration and environment information."
          />

          <InfoCard
            number="02"
            title="Diagnose"
            description="Detect common runtime, dependency and configuration issues."
          />

          <InfoCard
            number="03"
            title="Resolve"
            description="Receive evidence-backed fixes and commands to try."
          />
        </div>
      </section>
    </main>
  );
}

function InfoCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <p className="text-xs font-medium text-zinc-600">
        {number}
      </p>

      <h3 className="mt-3 font-semibold">
        {title}
      </h3>

      <p className="mt-2 break-words text-sm leading-6 text-zinc-500">
        {description}
      </p>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/10 bg-black/20 p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">
        {label}
      </p>

      <p className="mt-3 text-3xl font-semibold">
        {value}
      </p>

      <p className="mt-1 break-words text-xs text-zinc-500">
        {description}
      </p>
    </div>
  );
}

function ExampleButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="max-w-full rounded-lg border border-white/10 bg-white/[0.02] px-3.5 py-2 text-xs font-medium text-zinc-400 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
    >
      {label}
    </button>
  );
}