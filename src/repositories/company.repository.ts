import {Getter, inject} from '@loopback/core';
import {DefaultCrudRepository, repository} from '@loopback/repository';
import {MysqlDataSource} from '../datasources';
import {Company, CompanyRelations, Product} from '../models';
import {MetaPagination} from '../models/meta-pagination.model';
import {ProductRepository} from './product.repository';

export class CompanyRepository extends DefaultCrudRepository<
  Company,
  typeof Company.prototype.id,
  CompanyRelations
> {
  constructor(
    @inject('datasources.mysql') dataSource: MysqlDataSource,
    @repository.getter('ProductRepository')
    protected productRepositoryGetter: Getter<ProductRepository>,
  ) {
    super(Company, dataSource);
  }

  async getCompanyProductsPagination(companyId: number, page: number, rowsPerPage: number): Promise<MetaPagination> {
    const query = `SELECT count(p.id) total FROM store.products p inner join store.categories c on p.category_id = c.id
                  and c.active = 1 and c.deleted = 0 and p.active = 1 and p.deleted = 0 where p.company_id = ${companyId}`;

    const totalItems = (await this.execute(query))[0].total;
    const totalPages = Math.ceil(totalItems / rowsPerPage);

    const meta = new MetaPagination({
      totalItems,
      currentPage: page,
      totalPages: totalPages,
      loadMore: page < totalPages,
    });
    return meta;
  }

  async getCompanyProducts(companyId: number, offset: number, rowsPerPage: number): Promise<Product[]> {
    const query = `SELECT p.id,p.category_id categoryId,p.company_id companyId,p.code,p.name,p.description,p.brand,p.quantity,p.price
                FROM store.products p inner join store.categories c on p.category_id = c.id and c.active = 1 and c.deleted = 0 and p.active = 1 and p.deleted = 0
                where p.company_id = ${companyId} LIMIT ${offset},${rowsPerPage}`;

    return <Product[]>await this.execute(query);
  }

  async getCompanyByID(companyId: number): Promise<Company> {
    const query = `SELECT id,name,address FROM store.companies WHERE id = ${companyId} AND deleted = 0`;
    const company = <Company>(await this.execute(query))[0];

    return company;
  }

  async getCompanies(): Promise<Company[]> {
    const query = 'SELECT id,name,address FROM store.companies WHERE deleted = 0';
    const companies = <Company[]>await this.execute(query);

    return companies;
  }

  async createCompany(company: Company): Promise<Company> {
    const query = `INSERT INTO store.companies SET name = ?, address = ? `;
    const {name, address} = company;
    const result = await this.execute(query, [name, address]);
    const newCompany = <Company>await this.getCompanyByID(result.insertId);

    return newCompany;
  }

  async deleteCompany(companyId: number): Promise<void> {
    const query = `UPDATE store.companies SET deleted = 1 WHERE id = ${companyId}`;

    await this.execute(query);
  }
}
