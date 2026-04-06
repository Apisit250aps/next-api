# Core Workspace

## Run App

```bash
npm install
npm run dev
```

Open: <http://localhost:3000>

## Private Packages

This workspace now contains reusable packages in `packages/`:

- `@aps/core-types`: shared types (e.g. `ApiResponse`, `Entity`)
- `@aps/core`: base `Controller` and `Repository`

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
2. Build packages: `npm run build:packages`
3. Publish to your private registry (recommended: GitHub Packages), or install from Git URL for personal use.

If you use GitHub Packages, set package scopes and auth token in `.npmrc` before publish.
