import {authenticate} from '@loopback/authentication';
import {repository} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  HttpErrors,
  param,
  post,
  put,
  requestBody,
  response
} from '@loopback/rest';
import {Product} from '../models';
import {MetaPagination} from '../models/meta-pagination.model';
import {CompanyRepository, ProductRepository} from '../repositories';

@authenticate('jwt')
export class CompanyProductController {
  constructor(
    @repository(CompanyRepository)
    protected companyRepository: CompanyRepository,
    @repository(ProductRepository)
    protected productRepository: ProductRepository,
  ) {}

  @get('/companies/{id}/products', {
    responses: {
      '200': {
        description: 'Paginated array of company products and pagination metadata',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                meta: getModelSchemaRef(MetaPagination),
                products: {
                  type: 'array',
                  items: getModelSchemaRef(Product, {exclude: ['company']}),
                }
              },
            },
          },
        },
      },
      '400': {
        description: 'Page out of bounds',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: {
                  type: 'object',
                  properties: {
                    statusCode: {type: 'number'},
                    name: {type: 'string'},
                    message: {type: 'string'},
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  async find(
    @param.path.number('id') id: number,
    @param.query.number('rowsPerPage') rowsPerPage: number,
    @param.query.number('page') page: number,
  ): Promise<object> {
    const offset = (page - 1) * rowsPerPage;
    rowsPerPage = rowsPerPage || 20
    page = page || 1

    const metaPagination = await this.companyRepository.getCompanyProductsPagination(id, page, rowsPerPage);
    if (page > metaPagination.totalPages)
      throw new HttpErrors.BadRequest('Page out of bounds');
    else {
      const products = await this.companyRepository.getCompanyProducts(id, offset, rowsPerPage);
      return {meta: metaPagination, products}
    }
  }

  @get('/companies/products/{id}', {
    responses: {
      '200': {
        description: 'Company product by id',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Product),
          },
        },
      },
    },
  })
  async findProduct(@param.path.number('id') id: number): Promise<Product> {
    const product = await this.productRepository.getProductByID(id);
    const company = await this.companyRepository.getCompanyByID(
      product.companyId,
    );
    product.company = company;
    return product;
  }

  @post('/companies/{id}/products', {
    responses: {
      '200': {
        description: 'Company product created successfully',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Product, {exclude: ['company']}),
          },
        },
      },
    },
  })
  async create(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Product, {
            title: 'NewProductInCompany',
            exclude: ['id', 'companyId', 'company'],
            optional: ['company'],
          }),
        },
      },
    })
    product: Omit<Product, 'id'>,
  ): Promise<Product> {
    return this.productRepository.createProduct(id, product);
  }

  @put('/companies/products/{id}')
  @response(204, {
    description: 'Company product updated successfully',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Product, {
            title: 'Update company product',
            exclude: ['id', 'company'],
            optional: ['company'],
          }),
        },
      },
    })
    product: Product,
  ): Promise<void> {
    await this.productRepository.updateProduct(id, product);
  }

  @del('/companies/products/{id}', {
    responses: {
      '204': {
        description: 'Company product deleted successfully',
      },
    },
  })
  async delete(@param.path.number('id') id: number): Promise<void> {
    return this.productRepository.deleteProduct(id);
  }
}
