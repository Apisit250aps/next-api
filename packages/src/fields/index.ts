import { z } from 'zod'
import { v7 as uuidv7 } from 'uuid'

export const BaseEntity = <T extends z.ZodRawShape>(schema: T) => {
  return z.object({
    id: z.uuid().default(() => uuidv7()),
    ...schema,
    createdAt: z.date().default(() => new Date()),
    updatedAt: z.date().default(() => new Date()),
    deletedAt: z.date().nullable().default(null),
  })
}

export const StringField = () => z.string()
export const NumberField = () => z.number()
export const BooleanField = () => z.boolean()
export const DateField = () =>
  z.date().or(z.string().transform((str) => new Date(str).toDateString()))

export const DateTimeField = () =>
  z.date().or(z.string().transform((str) => new Date(str)))

export const UUIDField = () => z.uuid()
export const EmailField = () => z.email()
export const URLField = () => z.url()
export const AutoIdField = () => z.string().default(() => uuidv7())

export const ArrayField = <T>(itemSchema: z.ZodType<T>) => z.array(itemSchema)
export const ObjectField = <T extends z.ZodRawShape>(schema: T) =>
  z.object(schema)
export const EnumField = <T extends string>(...values: T[]) => z.enum(values)
export const OptionalField = <T extends z.ZodTypeAny>(field: T) =>
  field.optional()
export const NullableField = <T extends z.ZodTypeAny>(field: T) =>
  field.nullable()
