import { z } from 'zod'
import { uuidv7 } from './utils'

export const BaseEntitySchema = <T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
) => {
  return z.object({
    id: z.uuid().default(() => uuidv7()),
    ...schema.shape,
    createdAt: z.date().default(() => new Date()),
    updatedAt: z.date().default(() => new Date()),
  })
}
