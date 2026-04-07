import { z } from 'zod'
import Repository from '@aps/next-api-core/repository'
import type { CreateInput, UpdateInput } from '@aps/next-api-types'
import client from '../lib/mongo/index.js'
import { BaseEntity, EmailField, StringField } from '@aps/next-api-core/field'

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
  readonly schema = userSchema
  override readonly indexes = [
    {
      key: { email: 1 },
      unique: true,
      name: 'email_unique_index',
      partialFilterExpression: { deletedAt: null },
    },
  ]
}

export const userRepo = new UserRepository(client)

export default UserRepository
export type { User, CreateUserInput, UpdateUserInput }
