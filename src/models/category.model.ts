import {Entity, model, property} from '@loopback/repository';

@model({settings: {mysql: {table: 'categories'}, strict: true}})
export class Category extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      pattern: '^[A-Za-z0-9]+$',
      errorMessage: {
        pattern: 'The code can only contain numbers and letters.',
      },
    },
  })
  code: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      minLength: 2,
    },
  })
  name: string;

  @property({
    type: 'string',
    required: true,
  })
  description: string;

  @property({
    type: 'boolean',
    default: true,
  })
  active: boolean;

  constructor(data?: Partial<Category>) {
    super(data);
  }
}

export interface CategoryRelations {
  // describe navigational properties here
}

export type CategoryWithRelations = Category & CategoryRelations;
