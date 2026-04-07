# Core Workspace

Reusable Hono and MongoDB building blocks with shared API types.

## Run App

```bash
npm install
npm run dev
```

Open: <http://localhost:3000>

## Workspace Packages

- `@aps/next-api-types`: shared types such as `ApiResponse` and `Entity`
- `@aps/next-api-core`: reusable `Controller`, `Repository`, and field helpers
- `@aps/next-api`: root installable package for git-based consumption

Build reusable packages:

```bash
npm run build:packages
```

Build everything:

```bash
npm run build:all
```

## Install From Git

Use the tagged release for reproducible installs:

```bash
npm install git+https://github.com/Apisit250aps/core-repository.git#v0.1.0
```

The root package is published from git as `@aps/next-api` and exposes stable subpaths.

## Usage

```ts
import { Controller, Repository } from '@aps/next-api'
import { BaseEntity, EmailField, StringField } from '@aps/next-api/field'
import type { ApiResponse } from '@aps/next-api/types'
```

Available subpaths:

- `@aps/next-api`
- `@aps/next-api/controller`
- `@aps/next-api/repository`
- `@aps/next-api/base-controller`
- `@aps/next-api/base-repository`
- `@aps/next-api/field`
- `@aps/next-api/types`

## Release Flow

1. Verify the build with `npm run build:all`.
2. Commit the release changes.
3. Tag the release with `git tag v0.1.0`.
4. Push commits and tag with `git push origin main --tags`.

## Notes

- Git installs use committed code only.
- The `prepare` script builds workspace package dist files during git installation.
- Release notes are tracked in `release/versions.md`.
