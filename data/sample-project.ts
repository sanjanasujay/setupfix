import type { DiagnosisInput } from "../types/diagnosis";

const basePackageJson = `{
  "name": "demo-store",
  "version": "1.0.0",
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
}`;

const baseEnvExample = `DATABASE_URL=
NEXT_PUBLIC_API_URL=
OPENAI_API_KEY=`;
const pnpmPackageJson = `{
  "name": "demo-store",
  "version": "1.0.0",
  "packageManager": "pnpm@10.0.0",
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
}`;

export const sampleProjects: Record<string, DiagnosisInput> = {
  "node-mismatch": {
    packageJson: basePackageJson,
    envExample: baseEnvExample,
    nodeVersion: "18.20.4",
    envVariables: [
      "DATABASE_URL",
      "NEXT_PUBLIC_API_URL",
      "OPENAI_API_KEY",
    ],
    command: "npm run dev",
    terminalOutput: `> demo-store@1.0.0 dev
> next dev`,
  },

  "missing-env": {
    packageJson: basePackageJson,
    envExample: baseEnvExample,
    nodeVersion: "20.10.0",
    envVariables: [
      "DATABASE_URL",
      "NEXT_PUBLIC_API_URL",
    ],
    command: "npm run dev",
    terminalOutput: `> demo-store@1.0.0 dev
> next dev`,
  },

  "dependency-error": {
    packageJson: basePackageJson,
    envExample: baseEnvExample,
    nodeVersion: "20.10.0",
    envVariables: [
      "DATABASE_URL",
      "NEXT_PUBLIC_API_URL",
      "OPENAI_API_KEY",
    ],
    command: "npm run dev",
    terminalOutput: `Module not found: Can't resolve 'axios'`,
  },

  "bad-command": {
    packageJson: basePackageJson,
    envExample: baseEnvExample,
    nodeVersion: "20.10.0",
    envVariables: [
      "DATABASE_URL",
      "NEXT_PUBLIC_API_URL",
      "OPENAI_API_KEY",
    ],
    command: "npm run start-dev",
    terminalOutput: "",
  },

  "port-conflict": {
    packageJson: basePackageJson,
    envExample: baseEnvExample,
    nodeVersion: "20.10.0",
    envVariables: [
      "DATABASE_URL",
      "NEXT_PUBLIC_API_URL",
      "OPENAI_API_KEY",
    ],
    command: "npm run dev",
    terminalOutput: `Error: listen EADDRINUSE: address already in use :::3000`,
  },
  "package-manager": {
  packageJson: pnpmPackageJson,
  envExample: baseEnvExample,
  nodeVersion: "20.10.0",
  envVariables: [
    "DATABASE_URL",
    "NEXT_PUBLIC_API_URL",
    "OPENAI_API_KEY",
  ],
  command: "npm run dev",
  terminalOutput: "",
},
};