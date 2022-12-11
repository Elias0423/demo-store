import {authenticate} from '@loopback/authentication';
import {repository} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  param,
  post,
  requestBody,
  response,
} from '@loopback/rest';
import {Company} from '../models';
import {CompanyRepository} from '../repositories';

@authenticate('jwt')
export class CompanyController {
  constructor(
    @repository(CompanyRepository)
    public companyRepository: CompanyRepository,
  ) {}

  @post('/companies')
  @response(200, {
    description: 'Company created successfully',
    content: {'application/json': {schema: getModelSchemaRef(Company)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Company, {
            title: 'NewCompany',
            exclude: ['id'],
          }),
        },
      },
    })
    company: Omit<Company, 'id'>,
  ): Promise<Company> {
    return this.companyRepository.createCompany(company);
  }

  @get('/companies')
  @response(200, {
    description: 'Array of companies',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Company),
        },
      },
    },
  })
  async find(): Promise<Company[]> {
    return this.companyRepository.getCompanies();
  }

  @del('/companies/{id}')
  @response(204, {
    description: 'Company deleted successfully',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.companyRepository.deleteCompany(id);
  }
}
