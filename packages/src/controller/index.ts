import { Entity } from '../types/repository'
import BaseController from './base-controller'

abstract class Controller<T extends Entity> extends BaseController<T> {}

export default Controller
