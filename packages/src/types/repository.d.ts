export type Entity = {
  id: string
  createdAt: Date
  updatedAt: Date
  [key: string]: unknown
}

export type CreateInput<T extends Entity> = Omit<
  T,
  'id' | 'createdAt' | 'updatedAt'
>

export type UpdateInput<T extends Entity> = Partial<Omit<T, 'id' | 'createdAt'>>

export type ValidationError = {
  message: string
}

export type ValidationResult<T> =
  | {
      success: true
      data: T
    }
  | {
      success: false
      error: ValidationError
    }

export interface RepositoryContract<T extends Entity> {
  safeValidate(item: unknown): Promise<ValidationResult<T>>
  validate(item: unknown): Promise<T>
  create(item: CreateInput<T>): Promise<T>
  findById(id: string): Promise<T | null>
  findAll(...args: unknown[]): Promise<T[]>
  update(id: string, item: UpdateInput<T>): Promise<T>
  delete(id: string): Promise<void>
}
