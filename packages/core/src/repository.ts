import type { Entity } from '../../types/dist/index.js'
import BaseRepository from './base-repository.js'

abstract class Repository<T extends Entity> extends BaseRepository<T> {}

export default Repository
