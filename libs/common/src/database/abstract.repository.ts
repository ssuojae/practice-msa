import { Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { FilterQuery, Model, Types, UpdateQuery } from 'mongoose';
import { AbstractDocument } from './abstract.schema';

export abstract class AbstractRepository<TDocument extends AbstractDocument> {
  protected abstract readonly logger: Logger;
  protected abstract readonly uniqueFields: (keyof TDocument)[];

  constructor(protected readonly model: Model<TDocument>) {}

  async create(document: Omit<TDocument, '_id'>): Promise<TDocument> {
    try {
      const createdDocument = new this.model({
        ...document,
        _id: new Types.ObjectId(),
      });
      return (await createdDocument.save()).toJSON() as unknown as TDocument;
    } catch (error) {
      this.handleDuplicateKeyError(error);
    }
  }

  async findOne(filterQuery: FilterQuery<TDocument>): Promise<TDocument> {
    const document = await this.model
      .findOne(filterQuery)
      .lean<TDocument>(true);
    return document ?? this.handleNotFound(filterQuery);
  }

  async findOneAndUpdate(
    filterQuery: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
  ): Promise<TDocument> {
    await this.checkForDuplicateBeforeUpdate(update);

    const document = await this.model
      .findOneAndUpdate(filterQuery, update, { new: true })
      .lean<TDocument>(true);

    return document ?? this.handleNotFound(filterQuery);
  }

  async find(filterQuery: FilterQuery<TDocument>): Promise<TDocument[]> {
    return this.model.find(filterQuery).lean<TDocument[]>(true);
  }

  async findOneAndDelete(
    filterQuery: FilterQuery<TDocument>,
  ): Promise<TDocument> {
    const document = await this.model
      .findOneAndDelete(filterQuery)
      .lean<TDocument>(true);
    return document ?? this.handleNotFound(filterQuery);
  }

  private handleDuplicateKeyError(error: any): never {
    if (error.code === 11000) {
      this.logger.error('Duplicate key error', error);
      throw new ConflictException(
        'Duplicate key error: The value provided for a unique field is already in use.',
      );
    }
    throw error;
  }

  private handleNotFound(filterQuery: FilterQuery<TDocument>): never {
    this.logger.warn('Document was not found with filterQuery', filterQuery);
    throw new NotFoundException('Document was not found');
  }

  private async checkForDuplicateBeforeUpdate(
    update: UpdateQuery<TDocument>,
  ): Promise<void> {
    if (!update.$set) return;

    const fieldsToCheck = this.getFieldsToCheck(update);
    await this.checkFieldsForDuplicates(fieldsToCheck);
  }

  private getFieldsToCheck(
    update: UpdateQuery<TDocument>,
  ): [keyof TDocument, any][] {
    const entries = Object.entries(update.$set) as [keyof TDocument, any][];
    return entries.filter(([key]) => this.uniqueFields.includes(key));
  }

  private async checkFieldsForDuplicates(
    fieldsToCheck: [keyof TDocument, any][],
  ): Promise<void> {
    for (const [key, value] of fieldsToCheck) {
      await this.checkForDuplicate(key, value);
    }
  }

  private async checkForDuplicate(
    key: keyof TDocument,
    value: any,
  ): Promise<void> {
    const query: FilterQuery<TDocument> = {
      [key]: value,
    } as FilterQuery<TDocument>;
    const duplicate = await this.model.findOne(query).lean(true);
    if (duplicate) {
      this.logger.warn(`Duplicate key error for ${String(key)} field`, {
        [key]: value,
      });
      throw new ConflictException(
        `Duplicate key error: The value provided for the ${String(
          key,
        )} field is already in use.`,
      );
    }
  }
}
