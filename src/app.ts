import { Hono } from 'hono'
import UserController from './controllers/user.controller'

const users = new UserController()

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.route('/api', users.routes())

export default app
