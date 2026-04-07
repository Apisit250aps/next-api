# Versions

## v0.1.0

Release date: 2026-04-07

### Highlights

- Promoted the repository root to an installable package for git-based usage.
- Added stable subpath exports for controller, repository, field, and shared types.
- Kept workspace package builds in `prepare` so git installs build distributable files automatically.
- Documented the recommended tagged install flow for reproducible installs.

### Install

```bash
npm install git+https://github.com/Apisit250aps/core-repository.git#v0.1.0
```

### Import

```ts
import { Controller, Repository } from '@aps/next-api'
import { BaseEntity, EmailField, StringField } from '@aps/next-api/field'
import type { ApiResponse } from '@aps/next-api/types'
```

### Release Notes

- Root package name is `@aps/next-api`.
- Git installs now rely on root package exports instead of transitive workspace hoisting.
- Package contents explicitly include workspace packages so `npm pack` and git installs include built artifacts.

### Git Tag

```bash
git tag v0.1.0
git push origin v0.1.0
```
