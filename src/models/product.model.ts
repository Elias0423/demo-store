import {belongsTo, Entity, model, property} from '@loopback/repository';
import {Company} from './company.model';

@model({settings: {mysql: {table: 'products'}, strict: true}})
export class Product extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'number',
    required: true,
    name: 'category_id',
    mysql: {columnName: 'category_id'},
  })
  categoryId: number;

  @property({
    name: 'company_id',
    type: 'number',
    required: true,
    mysql: {columnName: 'company_id'},
  })
  companyId: number;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      minLength: 4,
      maxLength: 10,
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
      minLength: 4,
    },
  })
  name: string;

  @property({
    type: 'string',
    required: true,
  })
  description: string;

  @property({
    type: 'string',
    required: true,
  })
  brand: string;

  @property({
    type: 'number',
    default: 0,
  })
  quantity?: number;

  @property({
    type: 'number',
    required: true,
  })
  price: number;

  // @belongsTo(
  //   () => Category,
  //   {name: 'categoryId'},
  //   {mysql: {columnName: 'category_id'}},
  // )
  // categoryId: number;

  @belongsTo(() => Company)
  company?: Company;

  constructor(data?: Partial<Product>) {
    super(data);
  }
}

export interface ProductRelations {
  // describe navigational properties here
}

export type ProductWithRelations = Product & ProductRelations;
