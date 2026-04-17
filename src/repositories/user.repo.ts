import { z } from 'zod'
import Repository from '@aps/next-api-core/repository'
import type { CreateInput, UpdateInput } from '@aps/next-api-types'
import client from '../lib/mongo/index.js'
import { BaseEntity, EmailField, StringField } from '@aps/next-api-core/field'
import type { IndexDescription } from 'mongodb'

const userSchema = BaseEntity({
  name: StringField(),
  email: EmailField(),
  password: StringField(),
})

type User = z.infer<typeof userSchema>
type CreateUserInput = CreateInput<User>
type UpdateUserInput = UpdateInput<User>

class UserRepository extends Repository<User> {
  readonly collectionName = 'users'
  readonly schema: z.ZodType<User> = userSchema
  readonly indexes: IndexDescription[] = [
    {
      key: { email: 1 },
      unique: true,
      name: 'email_unique_index',
      partialFilterExpression: { deletedAt: null },
    },
    {
      key: { name: 1 },
      name: 'name_index',
      partialFilterExpression: { deletedAt: null },
    },
  ]
}

export const userRepo = new UserRepository(client)

export default UserRepository
export type { User, CreateUserInput, UpdateUserInput }
