import type {
  CreateInput,
  Entity,
  RepositoryContract,
  UpdateInput,
} from './repository.js'

export type ResponseStatus = 200 | 201 | 400 | 404 | 500

export interface ControllerContract<T extends Entity, Ctx = unknown> {
  readonly repository: RepositoryContract<T>
  readonly prefix: string
  readonly keyId: string

  get(c: Ctx): Promise<Response>
  getById(c: Ctx): Promise<Response>
  create(c: Ctx): Promise<Response>
  update(c: Ctx): Promise<Response>
  delete(c: Ctx): Promise<Response>
}

export type CreateHandlerInput<T extends Entity> = CreateInput<T>
export type UpdateHandlerInput<T extends Entity> = UpdateInput<T>
