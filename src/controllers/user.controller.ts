import Controller from '@aps/next-api-core/controller'
import { userRepo, type User } from '../repositories/user.repo'

class UserController extends Controller<User> {
  readonly repository = userRepo
  readonly prefix = 'users'

  override registered(): void {
    super.registered()
    this.app.get('/search', (c) => this.get(c))
  }
}

export default UserController
