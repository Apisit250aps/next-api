import type { Entity } from '@aps/next-api-types'
import BaseRepository from './base-repository'

abstract class Repository<T extends Entity> extends BaseRepository<T> {}

export default Repository
