# SetupFix

**Diagnose common local Node.js project setup failures before spending time debugging application code.**

SetupFix analyzes project configuration, environment requirements, developer commands, and terminal output to identify common setup problems and recommend concrete fixes.

> **Live Demo:** Coming soon  
> **Repository:** Add GitHub URL after publishing

---

## Why SetupFix?

Cloning an unfamiliar repository does not always mean it will run immediately.

A developer may encounter issues caused by:

- incompatible Node.js versions
- missing environment variables
- incorrect npm scripts
- ports already being used
- missing or undeclared dependencies
- incorrect package managers

The information needed to diagnose these problems is often spread across `package.json`, `.env.example`, terminal logs, and local environment configuration.

SetupFix combines these signals into one diagnostic workflow.

---

## Core Workflow

1. Provide the project's `package.json`.
2. Provide its `.env.example`.
3. Enter the local Node.js version.
4. Enter available environment variable names.
5. Enter the command being run.
6. Paste terminal output.
7. Run **Diagnose setup**.
8. Review blockers, warnings, passed checks, evidence, and suggested fixes.

SetupFix produces a setup health score and evidence-backed recommendations.

---

## Features

### Node.js Version Validation

Compares the developer's local Node.js version with the requirement defined in:

```json
{
  "engines": {
    "node": ">=20"
  }
}
```

Example result:

```text
BLOCKER

Node version mismatch

Current:
18.20.4

Required:
>=20

Suggested fix:
nvm install 20
nvm use 20
```

### Environment Variable Validation

Parses `.env.example` and compares the expected variable names against the developer's available local variables.

Example `.env.example`:

```env
DATABASE_URL=
NEXT_PUBLIC_API_URL=
OPENAI_API_KEY=
```

Local environment:

```text
DATABASE_URL, NEXT_PUBLIC_API_URL
```

Result:

```text
Missing:
OPENAI_API_KEY
```

SetupFix only asks for environment variable **names**. Secret values should never be pasted into the application.

### npm Script Validation

Checks whether a command references a script that actually exists in `package.json`.

Example:

```bash
npm run start-dev
```

while the project defines:

```json
{
  "scripts": {
    "dev": "next dev"
  }
}
```

Result:

```text
Command references an undefined npm script.

Suggested:
npm run dev
```

### Port Conflict Detection

Recognizes common `EADDRINUSE` terminal errors.

Example:

```text
Error: listen EADDRINUSE: address already in use :::3000
```

Suggested actions:

```bash
lsof -i :3000
```

or:

```bash
npm run dev -- -p 3001
```

### Dependency Error Detection

Recognizes missing-module errors such as:

```text
Module not found: Can't resolve 'axios'
```

SetupFix distinguishes between:

- a dependency that is not declared in `package.json`
- a dependency that is declared but appears unavailable locally

Example recommendation:

```bash
npm install axios
```

### Package Manager Validation

Checks the project's declared package manager:

```json
{
  "packageManager": "pnpm@10.0.0"
}
```

against the command being used.

For example:

```bash
npm run dev
```

produces a warning recommending:

```bash
pnpm run dev
```

### Setup Health Dashboard

Each diagnosis returns:

- health score from 0–100
- blockers
- warnings
- passed checks
- evidence for each finding
- recommended fixes
- copyable shell commands

The current scoring model is intentionally simple:

```text
Start at 100

Blocker: -25
Warning: -10
Info:    -5
```

The score is intended as a quick summary rather than a scientifically calibrated metric.

---

## Demo Scenarios

SetupFix includes several built-in scenarios that can be loaded directly from the interface:

- Node mismatch
- Missing environment variable
- Dependency error
- Invalid npm command
- Port conflict
- Package-manager mismatch

These examples make it possible to evaluate each diagnostic rule without preparing a separate repository.

---

## Example Input

### package.json

```json
{
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
    "react": "19.1.0",
    "react-dom": "19.1.0"
  }
}
```

### .env.example

```env
DATABASE_URL=
NEXT_PUBLIC_API_URL=
OPENAI_API_KEY=
```

### Local Node.js version

```text
20.10.0
```

### Local environment variables

```text
DATABASE_URL, NEXT_PUBLIC_API_URL
```

### Command

```bash
npm run dev
```

### Terminal output

```text
Error: listen EADDRINUSE: address already in use :::3000
```

---

## Example Output

```text
Setup health: 65 / 100
Status: blocked

1 blocker
1 warning

BLOCKER
Missing environment variables

Missing:
OPENAI_API_KEY


WARNING
Port already in use

Port:
3000

Suggested:
lsof -i :3000
```

---

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Vitest
- Vercel

The core diagnostic engine is written in TypeScript and does not require an external API or paid service.

---

## Architecture

```text
User Input
    |
    v
analyzeProject()
    |
    +-- Node version checker
    |
    +-- Environment checker
    |
    +-- Script checker
    |
    +-- Port checker
    |
    +-- Dependency checker
    |
    +-- Package-manager checker
    |
    v
DiagnosisResult
    |
    +-- health score
    +-- status
    +-- findings
    +-- passed checks
    |
    v
React Results Dashboard
```

Each diagnostic rule is isolated from the user interface so it can be tested and extended independently.

---

## Project Structure

```text
setupfix/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── data/
│   └── sample-project.ts
│
├── lib/
│   └── analyzer/
│       ├── analyze.ts
│       ├── dependency-check.ts
│       ├── env-check.ts
│       ├── node-version.ts
│       ├── package-manager-check.ts
│       ├── port-check.ts
│       └── script-check.ts
│
├── tests/
│   └── analyzer.test.ts
│
├── types/
│   └── diagnosis.ts
│
└── package.json
```

---

## Local Setup

### Prerequisites

Install:

- Node.js
- npm

### Clone the repository

```bash
git clone YOUR_REPOSITORY_URL
cd setupfix
```

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## Tests

Run the diagnostic-engine test suite:

```bash
npm test
```

Run linting:

```bash
npm run lint
```

Create a production build:

```bash
npm run build
```

Before submission, the project was verified with:

```text
npm test
npm run lint
npm run build
```

---

## Design Decisions

### Deterministic Diagnostics First

The current prototype uses deterministic rules instead of sending terminal logs to an LLM.

This was intentional.

Setup recommendations can cause developers to modify their environment or install packages, so recommendations should be traceable to concrete evidence whenever possible.

Each finding therefore contains:

```text
What was detected
        ↓
Evidence
        ↓
Why it matters
        ↓
Recommended action
```

An AI-assisted fallback could later help interpret unknown errors, while keeping deterministic checks as the primary diagnostic layer.

### Narrow Initial Scope

The prototype focuses on Node.js projects.

This keeps the first version small enough to fully implement while providing an architecture that could later support Python, Java, Docker, or other environments.

### No Secret Values

SetupFix only requires environment variable names.

Users should never paste secret `.env` values into the application.

---

## Difficult / Invalid Input

SetupFix handles malformed `package.json` input rather than silently failing.

Example:

```text
Invalid package.json

SetupFix could not parse your package.json.
Check the JSON syntax and try again.
```

Other analyzers that depend on valid project configuration avoid making unsupported conclusions when the configuration cannot be parsed.

---

## Implemented

- Node.js compatibility checks
- `.env.example` parsing
- missing environment variable detection
- npm script validation
- port-conflict detection
- missing dependency detection
- package-manager mismatch detection
- health scoring
- passed-check reporting
- evidence-backed findings
- copyable fix commands
- built-in demo scenarios
- responsive interface
- automated diagnostic-engine tests

---

## Simplified or Deferred

The current prototype does not:

- inspect a repository directly from the user's filesystem
- execute suggested commands
- inspect actual secret values
- support Python, Java, or other ecosystems
- diagnose arbitrary terminal errors
- resolve complex dependency graphs
- automatically determine whether a recommended fix succeeded

These were intentionally deferred to keep the first workflow narrow and complete.

---

## What I Would Build Next

The next version would turn SetupFix into a local developer tool that can inspect a repository automatically.

For example:

```bash
npx setupfix
```

The CLI could automatically inspect:

- `package.json`
- `.nvmrc`
- `.node-version`
- `.env.example`
- lockfiles
- package manager configuration
- local runtime versions
- occupied ports

Additional improvements would include:

1. detecting lockfile/package-manager inconsistencies
2. broader semantic-version range support
3. Python and Java project adapters
4. Docker/container diagnostics
5. VS Code integration
6. optional AI fallback for unrecognized terminal errors
7. validating whether a suggested fix actually resolved the problem

---

## AI Usage

AI tools were used during development to assist with brainstorming, implementation iteration, debugging, and code review.

I reviewed the generated suggestions, ran the application locally, manually tested the supported scenarios, and validated the diagnostic engine with automated tests.

The runtime product itself does **not** depend on an AI model or external AI API.

---

## Time Spent

**Development time:** `[ENTER YOUR ACTUAL TIME]`

The scope was intentionally limited to one complete Node.js setup-diagnosis workflow.

---

## License

This project was created as a prototype/case-study submission.