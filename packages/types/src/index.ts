export type ApiResponse<T = unknown> = {
  success: boolean
  message: string
  data: T
  error?: string
}

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
