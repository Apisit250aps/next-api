# @aps/next-api

Toolkit สำหรับสร้าง REST API ด้วย Hono + MongoDB + Zod โดยเน้นการใช้งานผ่าน 2 แกนหลัก:

- `Controller` สำหรับ route และ response pattern มาตรฐาน
- `Repository` สำหรับ data access พร้อม soft delete และ validation

เหมาะกับทั้ง Node.js และ Next.js Route Handler

## Install

```bash
npm install git+https://github.com/Apisit250aps/next-api.git#v0.2.0
```

## Public Exports (v0.2.0)

```ts
import { Controller, Repository } from '@aps/next-api'
import Controller from '@aps/next-api/controller'
import Repository from '@aps/next-api/repository'
import { BaseEntity, StringField, EmailField } from '@aps/next-api/entities'
```

Subpaths ที่รองรับ:

- `@aps/next-api`
- `@aps/next-api/controller`
- `@aps/next-api/repository`
- `@aps/next-api/entities`

## Quick Start

### 1) Define Entity + Repository

```ts
// repositories/user.repo.ts
import { z } from 'zod'
import Repository from '@aps/next-api/repository'
import { BaseEntity, StringField, EmailField } from '@aps/next-api/entities'
import type { CreateInput, UpdateInput } from '@aps/next-api'
import client from '../lib/mongo'

const UserEntity = BaseEntity({
  name: StringField(),
  email: EmailField(),
  password: StringField(),
})

type User = z.infer<typeof UserEntity>
type CreateUserInput = CreateInput<User>
type UpdateUserInput = UpdateInput<User>

class UserRepository extends Repository<User> {
  readonly collectionName = 'users'
  readonly schema = UserEntity
}

export const userRepo = new UserRepository(client)
export type { User, CreateUserInput, UpdateUserInput }
```

### 2) Define Controller

```ts
// controllers/user.controller.ts
import Controller from '@aps/next-api/controller'
import { userRepo, type User } from '../repositories/user.repo'

class UserController extends Controller<User> {
  readonly repository = userRepo
  readonly prefix = 'users'

  protected override registered(): void {
    super.registered()
    this.getRoute('me', async (c) => c.json({ message: 'current user' }))
  }
}

export default UserController
```

### 3) Mount Routes (Hono)

```ts
// app.ts
import { Hono } from 'hono'
import UserController from './controllers/user.controller'

const app = new Hono()
const users = new UserController()

app.route('/api', users.routes())

export default app
```

### 4) Next.js Route Handler

```ts
// app/api/[[...route]]/route.ts
import { handle } from 'hono/vercel'
import { Hono } from 'hono'
import UserController from '@/controllers/user.controller'

const app = new Hono().basePath('/api')
const users = new UserController()

app.route('/', users.routes())

export const GET = handle(app)
export const POST = handle(app)
export const PUT = handle(app)
export const DELETE = handle(app)
```

## Built-in CRUD Routes

| Method | Path |
| --- | --- |
| `GET` | `/{prefix}` |
| `GET` | `/{prefix}/:id` |
| `POST` | `/{prefix}` |
| `PUT` | `/{prefix}/:id` |
| `DELETE` | `/{prefix}/:id` |

## Repository Methods

| Method | Description |
| --- | --- |
| `findAll(filters, options?)` | Query ทั้งหมด (บังคับ `deletedAt: null`) |
| `findById(id)` | Query เอกสารตาม `id` |
| `create(item)` | Validate + insert |
| `update(id, item)` | Update ข้อมูล + set `updatedAt` |
| `delete(id)` | Soft delete (`deletedAt = now`) |
| `safeValidate(item)` | Validate แบบไม่ throw |
| `validate(item)` | Validate แล้ว throw เมื่อไม่ผ่าน |
| `aggregate(...)` | MongoDB aggregation passthrough |

## Entity Helpers (`@aps/next-api/entities`)

```ts
import {
  BaseEntity,
  StringField,
  NumberField,
  BooleanField,
  DateField,
  DateTimeField,
  UUIDField,
  EmailField,
  URLField,
  AutoIdField,
  ArrayField,
  ObjectField,
  EnumField,
  OptionalField,
  NullableField,
} from '@aps/next-api/entities'
```

`BaseEntity` จะเติม fields ต่อไปนี้ให้โดยอัตโนมัติ:

- `id` (UUID v7)
- `createdAt` (`Date`)
- `updatedAt` (`Date`)
- `deletedAt` (`Date | null`)

## Shared Types

```ts
import type {
  ApiResponse,
  Entity,
  CreateInput,
  UpdateInput,
  ValidationError,
  ValidationResult,
  RepositoryContract,
  ResponseStatus,
  ControllerContract,
} from '@aps/next-api'
```

## Scripts

```bash
npm run dev
npm run build:packages
npm run build
npm run build:all
npm run lint
npm run clean:packages
```

## Dependencies Credits

### Runtime Dependencies

| Package | Purpose |
| --- | --- |
| [hono](https://www.npmjs.com/package/hono) | Web framework สำหรับจัดการ routes และ middleware |
| [@hono/node-server](https://www.npmjs.com/package/@hono/node-server) | Node.js adapter สำหรับรัน Hono บนเซิร์ฟเวอร์ |
| [mongodb](https://www.npmjs.com/package/mongodb) | MongoDB Node.js driver |
| [zod](https://www.npmjs.com/package/zod) | Runtime schema validation และ type inference |
| [uuid](https://www.npmjs.com/package/uuid) | สร้าง UUID (ใช้งาน UUID v7 สำหรับ `id`) |
| [lodash](https://www.npmjs.com/package/lodash) | Utility functions สำหรับจัดการข้อมูล |

### Development Dependencies

| Package | Purpose |
| --- | --- |
| [typescript](https://www.npmjs.com/package/typescript) | Type checking และ build |
| [eslint](https://www.npmjs.com/package/eslint) | Linting โค้ด |
| [typescript-eslint](https://www.npmjs.com/package/typescript-eslint) | ESLint rules/parser สำหรับ TypeScript |
| [@eslint/js](https://www.npmjs.com/package/@eslint/js) | ESLint core config สำหรับ JavaScript |
| [@types/node](https://www.npmjs.com/package/@types/node) | Type definitions สำหรับ Node.js |
| [@types/lodash](https://www.npmjs.com/package/@types/lodash) | Type definitions สำหรับ lodash |

## Release Notes

- [Versions](./release/versions.md)
- [v0.2.0](./release/v0-2-0.md)

## Notes

- Git install จะใช้ไฟล์ที่ commit แล้วเท่านั้น
- `prepare` จะ build packages อัตโนมัติระหว่างติดตั้งจาก git

Built by [Apisit250aps](https://github.com/Apisit250aps)
