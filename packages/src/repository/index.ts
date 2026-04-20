import { Entity } from '../types/repository'
import BaseRepository from './base-repository'

abstract class Repository<T extends Entity> extends BaseRepository<T> {}

export default Repository
