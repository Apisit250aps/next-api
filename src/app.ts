import { Hono } from 'hono'
import UserController from './controllers/user.controller.js'

const users = new UserController()

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.route('/api', users.routes())
app.route('/', users.routes())
export default app
