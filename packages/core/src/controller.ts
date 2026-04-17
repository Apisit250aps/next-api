import type { Entity } from '../../types/dist/index.js'
import BaseController from './base-controller.js'

abstract class Controller<T extends Entity> extends BaseController<T> {}

export default Controller
