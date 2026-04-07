import type {
  ApiResponse,
  Entity,
  CreateInput,
  UpdateInput,
} from '@aps/next-api-types'
import type Repository from '../repository/index.js'
import { Hono, type Context } from 'hono'

abstract class Controller<T extends Entity> {
  abstract readonly repository: Repository<T>
  abstract readonly prefix: string
  protected app: Hono

  constructor() {
    this.app = new Hono()
    this.routes()
  }

  protected routes(): void {
    this.app.get(`${this.prefix}/`, (c) => this.get(c))
    this.app.get(`${this.prefix}/:id`, (c) => this.getById(c))
    this.app.post(`${this.prefix}/`, (c) => this.create(c))
    this.app.put(`${this.prefix}/:id`, (c) => this.update(c))
    this.app.delete(`${this.prefix}/:id`, (c) => this.delete(c))
  }

  async get(c: Context): Promise<Response> {
    try {
      const items = await this.repository.findAll()
      return c.json<ApiResponse<T[]>>({
        success: true,
        message: 'Fetched successfully',
        data: items,
      })
    } catch (error) {
      return c.json<ApiResponse<null>>(
        {
          success: false,
          message: 'Failed to fetch items',
          data: null,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        500,
      )
    }
  }

  async getById(c: Context): Promise<Response> {
    const { id } = c.req.param()
    try {
      const item = await this.repository.findById(id)
      if (!item) {
        return c.json<ApiResponse<null>>(
          {
            success: false,
            message: 'Not found',
            data: null,
            error: 'Not found',
          },
          404,
        )
      }
      return c.json<ApiResponse<T>>({
        success: true,
        message: 'Fetched successfully',
        data: item,
      })
    } catch (error) {
      return c.json<ApiResponse<null>>(
        {
          success: false,
          message: 'Failed to fetch item',
          data: null,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        500,
      )
    }
  }

  async create(c: Context): Promise<Response> {
    try {
      const body = await c.req.json<CreateInput<T>>()
      const created = await this.repository.create(body)
      return c.json<ApiResponse<T>>(
        {
          success: true,
          message: 'Created successfully',
          data: created,
        },
        201,
      )
    } catch (error) {
      return c.json<ApiResponse<null>>(
        {
          success: false,
          message: 'Failed to create item',
          data: null,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        400,
      )
    }
  }

  async update(c: Context): Promise<Response> {
    const { id } = c.req.param()
    try {
      const body = await c.req.json<UpdateInput<T>>()
      const updated = await this.repository.update(id, body)
      return c.json<ApiResponse<T>>({
        success: true,
        message: 'Updated successfully',
        data: updated,
      })
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return c.json<ApiResponse<null>>(
          {
            success: false,
            message: 'Not found',
            data: null,
            error: error.message,
          },
          404,
        )
      }
      return c.json<ApiResponse<null>>(
        {
          success: false,
          message: 'Failed to update item',
          data: null,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        400,
      )
    }
  }

  async delete(c: Context): Promise<Response> {
    const { id } = c.req.param()
    try {
      await this.repository.delete(id)
      return c.json<ApiResponse<null>>({
        success: true,
        message: 'Deleted successfully',
        data: null,
      })
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return c.json<ApiResponse<null>>(
          {
            success: false,
            message: 'Not found',
            data: null,
            error: error.message,
          },
          404,
        )
      }
      return c.json<ApiResponse<null>>(
        {
          success: false,
          message: 'Failed to delete item',
          data: null,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        500,
      )
    }
  }

  getRouter(): Hono {
    return this.app
  }
}

export default Controller
