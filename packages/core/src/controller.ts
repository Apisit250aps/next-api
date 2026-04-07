import type { Entity } from '@aps/next-api-types'
import BaseController from './base-controller.js'

abstract class Controller<T extends Entity> extends BaseController<T> {}

export default Controller
