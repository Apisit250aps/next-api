# Core Workspace

## Run App

```bash
npm install
npm run dev
```

Open: <http://localhost:3000>

## Private Packages

This workspace now contains reusable packages in `packages/`:

- `@aps/next-api-types`: shared types (e.g. `ApiResponse`, `Entity`)
- `@aps/next-api-core`: base `Controller` and `Repository`

Build packages:

```bash
npm run build:packages
```

Build everything:

```bash
npm run build:all
```

## Suggested Personal Publishing Flow

1. Bump versions in:

- `packages/types/package.json`
- `packages/core/package.json`

1. Build packages: `npm run build:packages`
2. Publish to your private registry (recommended: GitHub Packages), or install from Git URL for personal use.

If you use GitHub Packages, set package scopes and auth token in `.npmrc` before publish.

## Install From Git In Another Project

After committing and pushing this repo, install with one command:

```bash
npm install git+https://github.com/Apisit250aps/core-repository.git#main
```

Then import in your project:

```ts
import Controller from '@aps/next-api-core/controller'
import Repository, { BaseEntitySchema } from '@aps/next-api-core/repository'
import type { ApiResponse } from '@aps/next-api-types'
```

Notes:

- Git install uses committed code only. Commit changes before installing from another project.
- This repo runs `prepare` on git install to build package dist files automatically.
- If you want reproducible installs, use a tag instead of `#main` (for example `#v0.1.0`).
