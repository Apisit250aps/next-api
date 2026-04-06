import type {
  MongoClient,
  IndexDescription,
  Filter,
  OptionalUnlessRequiredId,
  UpdateFilter,
} from 'mongodb'

import { uuidv7 } from './utils'

import { z } from 'zod'
import type { Entity, CreateInput, UpdateInput } from '@/types'

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
