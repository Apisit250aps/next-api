import type {
  ApiResponse,
  Entity,
  CreateInput,
  UpdateInput,
} from '@aps/next-api-types'
import { Hono, type Context } from 'hono'

type ResponseStatus = 200 | 201 | 400 | 404 | 500

type RepositoryLike<T extends Entity> = {
  findAll(filters: Record<string, unknown>): Promise<T[]>
  findById(id: string): Promise<T | null>
  safeValidate(item: unknown): Promise<
    | {
        success: true
        data: CreateInput<T>
      }
    | {
        success: false
        error: {
          message: string
        }
      }
  >
  create(item: CreateInput<T>): Promise<T>
  update(id: string, item: UpdateInput<T>): Promise<T>
  delete(id: string): Promise<void>
}

abstract class BaseController<T extends Entity> {
  abstract readonly repository: RepositoryLike<T>
  readonly prefix: string = ''
  readonly keyId = 'id'
  public app: Hono
  private isRegistered = false

  constructor() {
    this.app = new Hono()
  }

  protected getRoute(path: string, handler: (c: Context) => Promise<Response>) {
    this.app.get(this.getBasePath(path), handler)
  }
  protected postRoute(
    path: string,
    handler: (c: Context) => Promise<Response>,
  ) {
    this.app.post(this.getBasePath(path), handler)
  }
  protected putRoute(path: string, handler: (c: Context) => Promise<Response>) {
    this.app.put(this.getBasePath(path), handler)
  }
  protected deleteRoute(
    path: string,
    handler: (c: Context) => Promise<Response>,
  ) {
    this.app.delete(this.getBasePath(path), handler)
  }

  private getBasePath(sub?: string): string {
    const prefix = this.prefix?.trim().replace(/^\/+|\/+$/g, '')
    const path = [prefix, sub].filter(Boolean).join('/')
    return path ? `/${path}` : '/'
  }

  protected registered(): void {
    this.getRoute('', (c) => this.get(c))
    this.getRoute(`:${this.keyId}`, (c) => this.getById(c))
    this.postRoute('', (c) => this.create(c))
    this.putRoute(`:${this.keyId}`, (c) => this.update(c))
    this.deleteRoute(`:${this.keyId}`, (c) => this.delete(c))
  }

  public routes(): Hono {
    if (!this.isRegistered) {
      this.registered()
      this.isRegistered = true
    }
    return this.app
  }

  protected response<D>(
    c: Context,
    status: ResponseStatus,
    payload: ApiResponse<D>,
  ): Response {
    c.status(status)
    return c.json<ApiResponse<D>>(payload)
  }

  protected ok<D>(c: Context, data: D, message = 'Success'): Response {
    return this.response(c, 200, {
      success: true,
      message,
      data,
    })
  }

  protected created<D>(
    c: Context,
    data: D,
    message = 'Created successfully',
  ): Response {
    return this.response(c, 201, {
      success: true,
      message,
      data,
    })
  }

  protected badRequest(
    c: Context,
    message = 'Bad request',
    error = 'Bad request',
  ): Response {
    return this.response(c, 400, {
      success: false,
      message,
      data: null,
      error,
    })
  }

  protected notFound(
    c: Context,
    message = 'Not found',
    error = 'Not found',
  ): Response {
    return this.response(c, 404, {
      success: false,
      message,
      data: null,
      error,
    })
  }

  protected error(
    c: Context,
    message = 'Internal server error',
    error = 'Internal server error',
    status: ResponseStatus = 500,
  ): Response {
    return this.response(c, status, {
      success: false,
      message,
      data: null,
      error,
    })
  }

  protected isNotFoundError(error: unknown): error is Error {
    return error instanceof Error && error.message.includes('not found')
  }

  async get(c: Context): Promise<Response> {
    try {
      const items = await this.repository.findAll({})
      return this.ok(c, items, 'Fetched successfully')
    } catch (error) {
      return this.error(
        c,
        'Failed to fetch items',
        error instanceof Error ? error.message : 'Unknown error',
      )
    }
  }

  async getById(c: Context): Promise<Response> {
    const { [this.keyId]: id } = c.req.param()
    try {
      const item = await this.repository.findById(id)
      if (!item) {
        return this.notFound(c)
      }
      return this.ok(c, item, 'Fetched successfully')
    } catch (error) {
      return this.error(
        c,
        'Failed to fetch item',
        error instanceof Error ? error.message : 'Unknown error',
      )
    }
  }

  async create(c: Context): Promise<Response> {
    try {
      const body = await c.req.json<CreateInput<T>>()
      const validate = await this.repository.safeValidate(body)
      if (!validate.success) {
        return this.badRequest(
          c,
          'Validation failed',
          validate.error?.message ?? 'Validation failed',
        )
      }
      const created = await this.repository.create(validate.data)
      return this.created(c, created)
    } catch (error) {
      return this.badRequest(
        c,
        'Failed to create item',
        error instanceof Error ? error.message : 'Unknown error',
      )
    }
  }

  async update(c: Context): Promise<Response> {
    const { [this.keyId]: id } = c.req.param()
    try {
      const body = await c.req.json<UpdateInput<T>>()
      const updated = await this.repository.update(id, body)
      return this.ok(c, updated, 'Updated successfully')
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return this.notFound(c, 'Not found', error.message)
      }
      return this.badRequest(
        c,
        'Failed to update item',
        error instanceof Error ? error.message : 'Unknown error',
      )
    }
  }

  async delete(c: Context): Promise<Response> {
    const { [this.keyId]: id } = c.req.param()
    try {
      await this.repository.delete(id)
      return this.ok(c, null, 'Deleted successfully')
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return this.notFound(c, 'Not found', error.message)
      }
      return this.error(
        c,
        'Failed to delete item',
        error instanceof Error ? error.message : 'Unknown error',
      )
    }
  }
}

export default BaseController
