import type {
  Collection,
  MongoClient,
  IndexDescription,
  Filter,
  OptionalUnlessRequiredId,
  UpdateFilter,
} from 'mongodb'

import { uuidv7 } from './utils.js'
import { BaseEntitySchema } from './model.js'

import { z } from 'zod'
import type { Entity, CreateInput, UpdateInput } from '@aps/next-api-types'

abstract class Repository<T extends Entity> {
  abstract readonly collectionName: string
  abstract readonly schema: z.ZodType<T>
  abstract readonly indexes: IndexDescription[]

  protected client: MongoClient

  constructor(client: MongoClient) {
    this.client = client
    this.createIndexes().catch((error) => {
      console.error(`Error creating indexes for ${this.collectionName}:`, error)
    })
  }

  protected async getCollection() {
    return this.client.db().collection<T>(this.collectionName)
  }

  public async collection(): Promise<Collection<T>> {
    return this.getCollection()
  }

  private async createIndexes(): Promise<void> {
    const collection = await this.getCollection()

    try {
      if (this.indexes.length > 0) {
        const createdIndexNames = await collection.createIndexes(this.indexes)
        console.log(
          `Indexes created for ${this.collectionName}:`,
          createdIndexNames,
        )
      }
    } catch (error) {
      throw new Error(
        `Failed to create indexes for ${this.collectionName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
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

  public async findOne(
    ...args: Parameters<Collection<T>['findOne']>
  ): ReturnType<Collection<T>['findOne']> {
    const collection = await this.getCollection()
    return collection.findOne(...args)
  }

  public async findCursor(
    ...args: Parameters<Collection<T>['find']>
  ): Promise<ReturnType<Collection<T>['find']>> {
    const collection = await this.getCollection()
    return collection.find(...args)
  }

  public async aggregateCursor(
    ...args: Parameters<Collection<T>['aggregate']>
  ): Promise<ReturnType<Collection<T>['aggregate']>> {
    const collection = await this.getCollection()
    return collection.aggregate(...args)
  }

  public async countDocuments(
    ...args: Parameters<Collection<T>['countDocuments']>
  ): ReturnType<Collection<T>['countDocuments']> {
    const collection = await this.getCollection()
    return collection.countDocuments(...args)
  }

  public async distinct(
    ...args: Parameters<Collection<T>['distinct']>
  ): ReturnType<Collection<T>['distinct']> {
    const collection = await this.getCollection()
    return collection.distinct(...args)
  }

  public async insertOne(
    ...args: Parameters<Collection<T>['insertOne']>
  ): ReturnType<Collection<T>['insertOne']> {
    const collection = await this.getCollection()
    return collection.insertOne(...args)
  }

  public async insertMany(
    ...args: Parameters<Collection<T>['insertMany']>
  ): ReturnType<Collection<T>['insertMany']> {
    const collection = await this.getCollection()
    return collection.insertMany(...args)
  }

  public async updateOne(
    ...args: Parameters<Collection<T>['updateOne']>
  ): ReturnType<Collection<T>['updateOne']> {
    const collection = await this.getCollection()
    return collection.updateOne(...args)
  }

  public async updateMany(
    ...args: Parameters<Collection<T>['updateMany']>
  ): ReturnType<Collection<T>['updateMany']> {
    const collection = await this.getCollection()
    return collection.updateMany(...args)
  }

  public async replaceOne(
    ...args: Parameters<Collection<T>['replaceOne']>
  ): ReturnType<Collection<T>['replaceOne']> {
    const collection = await this.getCollection()
    return collection.replaceOne(...args)
  }

  public async deleteOne(
    ...args: Parameters<Collection<T>['deleteOne']>
  ): ReturnType<Collection<T>['deleteOne']> {
    const collection = await this.getCollection()
    return collection.deleteOne(...args)
  }

  public async deleteMany(
    ...args: Parameters<Collection<T>['deleteMany']>
  ): ReturnType<Collection<T>['deleteMany']> {
    const collection = await this.getCollection()
    return collection.deleteMany(...args)
  }

  public async findOneAndUpdate(
    ...args: Parameters<Collection<T>['findOneAndUpdate']>
  ): ReturnType<Collection<T>['findOneAndUpdate']> {
    const collection = await this.getCollection()
    return collection.findOneAndUpdate(...args)
  }

  public async findOneAndDelete(
    ...args: Parameters<Collection<T>['findOneAndDelete']>
  ): ReturnType<Collection<T>['findOneAndDelete']> {
    const collection = await this.getCollection()
    return collection.findOneAndDelete(...args)
  }

  public async findOneAndReplace(
    ...args: Parameters<Collection<T>['findOneAndReplace']>
  ): ReturnType<Collection<T>['findOneAndReplace']> {
    const collection = await this.getCollection()
    return collection.findOneAndReplace(...args)
  }

  public async create(item: CreateInput<T>): Promise<T> {
    const collection = await this.getCollection()

    const now = new Date()
    const dataToInsert = {
      id: uuidv7(),
      ...item,
      createdAt: now,
      updatedAt: now,
    }

    const validatedItem = await this.validate(dataToInsert)

    const insertResult = await collection.insertOne(
      validatedItem as OptionalUnlessRequiredId<T>,
    )

    if (!insertResult.acknowledged) {
      throw new Error('Failed to insert document into database')
    }

    return {
      ...validatedItem,
    } as T
  }

  public async findById(id: string): Promise<T | null> {
    const collection = await this.getCollection()

    try {
      const document = await collection.findOne({
        id,
      } as unknown as Filter<T>)
      return document as T | null
    } catch (error) {
      throw new Error(
        `Failed to find document by id: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  public async findAll(): Promise<T[]> {
    const collection = await this.getCollection()

    try {
      const documents = await collection.find({}).toArray()
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
      { id } as unknown as Filter<T>,
      { $set: dataToUpdate } as UpdateFilter<T>,
      { returnDocument: 'after' },
    )

    if (!updateResult || !updateResult.value) {
      throw new Error(`Document with id ${id} not found`)
    }

    return updateResult.value as T
  }

  public async delete(id: string): Promise<void> {
    const collection = await this.getCollection()

    const deleteResult = await collection.deleteOne({
      id,
    } as unknown as Filter<T>)

    if (deleteResult.deletedCount === 0) {
      throw new Error(`Document with id ${id} not found`)
    }
  }

  public async find(filter: Filter<T>): Promise<T[]> {
    const collection = await this.getCollection()
    try {
      const documents = await collection.find(filter).toArray()
      return documents as T[]
    } catch (error) {
      throw new Error(
        `Failed to find documents: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }
}

export default Repository
export { BaseEntitySchema }
