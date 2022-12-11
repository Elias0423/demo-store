import {authenticate} from '@loopback/authentication';
import {repository} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  HttpErrors,
  param,
  patch,
  post,
  put,
  requestBody,
  response,
} from '@loopback/rest';
import {Category} from '../models';
import {CategoryRepository} from '../repositories';

@authenticate('jwt')
export class CategoryController {
  constructor(
    @repository(CategoryRepository)
    public categoryRepository: CategoryRepository,
  ) {}

  @post('/categories', {
    responses: {
      '200': {
        description: 'Category created successfully',
        content: {'application/json': {schema: getModelSchemaRef(Category)}},
      },
      '409': {
        description: 'Attempt to create entity conflicts with the existing',
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
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Category, {
            title: 'NewCategory',
            exclude: ['id'],
          }),
        },
      },
    })
    category: Omit<Category, 'id'>,
  ): Promise<Category> {
    const categories = await this.categoryRepository.getCategoriesByCodeOrName(category.code, category.name);
    if (categories.length > 0) throw new HttpErrors.Conflict('Attempt to create entity conflicts with the existing',);
    else return this.categoryRepository.createCategory(category);
  }

  @get('/categories')
  @response(200, {
    description: 'Array of categories',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Category),
        },
      },
    },
  })
  async find(): Promise<Category[]> {
    return this.categoryRepository.getAllCategories();
  }

  @patch('/categories/{id}/status')
  @response(204, {
    description: 'Category active status changed',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Category, {
            exclude: ['id', 'code', 'name', 'description'],
          }),
        },
      },
    })
    category: Category,
  ): Promise<void> {
    await this.categoryRepository.updateCategoryStatus(id, category.active);
  }

  @put('/categories/{id}')
  @response(204, {
    description: 'Category updated successfully',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Category, {
            exclude: ['id'],
          }),
        },
      },
    })
    category: Category,
  ): Promise<void> {
    await this.categoryRepository.updateCategory(id, category);
  }

  @del('/categories/{id}')
  @response(204, {
    description: 'Category deleted successfully',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.categoryRepository.deleteCategory(id);
  }
}
