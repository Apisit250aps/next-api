import type {
  Collection,
  MongoClient,
  IndexDescription,
  Filter,
  OptionalUnlessRequiredId,
  UpdateFilter,
  FindOptions,
  Abortable,
} from 'mongodb'

import { z } from 'zod'
import { CreateInput, Entity, UpdateInput } from '../types'

abstract class BaseRepository<T extends Entity> {
  abstract readonly collectionName: string
  abstract readonly schema: z.ZodType<T>
  readonly indexes: IndexDescription[] = []
  protected collection: Collection<T> | null = null

  protected client: MongoClient

  constructor(client: MongoClient) {
    this.client = client
  }

  protected async getCollection(): Promise<Collection<T>> {
    if (!this.collection) {
      await this.client.connect()
      const collection = this.client.db().collection<T>(this.collectionName)
      await collection.createIndexes([
        { key: { id: 1 }, unique: true },
        ...this.indexes,
      ])
      this.collection = collection
    }
    return this.collection
  }

  public async safeValidate(item: unknown) {
    return await this.schema.safeParseAsync(item)
  }

  public async validate(item: unknown): Promise<T> {
    try {
      return await this.schema.parseAsync(item)
    } catch (error) {
      throw new Error(
        `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  public async create(item: CreateInput<T>): Promise<T> {
    const collection = await this.getCollection()
    const data = await this.validate(item)

    const insertResult = await collection.insertOne(
      data as OptionalUnlessRequiredId<T>,
    )

    if (!insertResult.acknowledged) {
      throw new Error('Failed to insert document into database')
    }

    return data as T
  }

  public async findById(id: string): Promise<T | null> {
    const collection = await this.getCollection()
    try {
      const document = await collection.findOne(
        {
          id,
          deletedAt: null,
        } as unknown as Filter<T>,
        { projection: { _id: 0, deletedAt: 0 } },
      )
      return document as T | null
    } catch (error) {
      throw new Error(
        `Failed to find document by id: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  public async findAll(
    filters: Filter<T>,
    options?: FindOptions & Abortable,
  ): Promise<T[]> {
    const collection = await this.getCollection()
    try {
      const documents = await collection
        .find(
          {
            ...filters,
            deletedAt: null,
          },
          {
            projection: { _id: 0, deletedAt: 0 },
            ...options,
          },
        )
        .toArray()
      return documents as T[]
    } catch (error) {
      throw new Error(
        `Failed to fetch all documents: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  public async update(id: string, item: UpdateInput<T>): Promise<T> {
    const collection = await this.getCollection()
    const now = new Date()
    const dataToUpdate = {
      ...item,
      updatedAt: now,
    }

    const updateResult = await collection.findOneAndUpdate(
      { id, deletedAt: null } as unknown as Filter<T>,
      { $set: dataToUpdate } as UpdateFilter<T>,
      { returnDocument: 'after', projection: { _id: 0, deletedAt: 0 } },
    )

    if (!updateResult || !updateResult.value) {
      throw new Error(`Document with id ${id} not found`)
    }

    return updateResult.value as T
  }

  public async delete(id: string): Promise<void> {
    const collection = await this.getCollection()
    const deleteResult = await collection.updateOne(
      { id, deletedAt: null } as unknown as Filter<T>,
      { $set: { deletedAt: new Date() } } as unknown as UpdateFilter<T>,
    )

    if (deleteResult.matchedCount === 0) {
      throw new Error(`Document with id ${id} not found`)
    }
  }

  public async aggregate(
    ...args: Parameters<Collection<T>['aggregate']>
  ): Promise<ReturnType<Collection<T>['aggregate']>> {
    const collection = await this.getCollection()
    return collection.aggregate(...args)
  }
}

export default BaseRepository
