import {Model, model, property} from '@loopback/repository';

@model()
export class MetaPagination extends Model {
  @property({
    type: 'number',
    required: true,
  })
  totalItems: number;

  @property({
    type: 'number',
    required: true,
  })
  currentPage: number;

  @property({
    type: 'number',
    required: true,
  })
  totalPages: number;

  @property({
    type: 'boolean',
    required: true,
  })
  loadMore: boolean;


  constructor(data?: Partial<MetaPagination>) {
    super(data);
  }
}

export interface MetaPaginationRelations {
  // describe navigational properties here
}

export type MetaPaginationWithRelations = MetaPagination & MetaPaginationRelations;
