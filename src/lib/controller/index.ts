import type { Entity, CreateInput, UpdateInput } from '../repository'
import type Repository from '../repository'
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
      return c.json(items)
    } catch (error) {
      return c.json(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        500,
      )
    }
  }

  async getById(c: Context): Promise<Response> {
    const { id } = c.req.param()
    try {
      const item = await this.repository.findById(id)
      if (!item) {
        return c.json({ error: 'Not found' }, 404)
      }
      return c.json(item)
    } catch (error) {
      return c.json(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        500,
      )
    }
  }

  async create(c: Context): Promise<Response> {
    try {
      const body = await c.req.json<CreateInput<T>>()
      const created = await this.repository.create(body)
      return c.json(created, 201)
    } catch (error) {
      return c.json(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        400,
      )
    }
  }

  async update(c: Context): Promise<Response> {
    const { id } = c.req.param()
    try {
      const body = await c.req.json<UpdateInput<T>>()
      const updated = await this.repository.update(id, body)
      return c.json(updated)
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return c.json({ error: error.message }, 404)
      }
      return c.json(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        400,
      )
    }
  }

  async delete(c: Context): Promise<Response> {
    const { id } = c.req.param()
    try {
      await this.repository.delete(id)
      return c.json({ success: true })
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return c.json({ error: error.message }, 404)
      }
      return c.json(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        500,
      )
    }
  }

  getRouter(): Hono {
    return this.app
  }
}

export default Controller
