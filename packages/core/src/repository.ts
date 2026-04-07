import type { Entity } from '@aps/next-api-types'
import BaseRepository from './base-repository.js'

abstract class Repository<T extends Entity> extends BaseRepository<T> {}

export default Repository
