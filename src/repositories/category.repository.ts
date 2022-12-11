import {Getter, inject} from '@loopback/core';
import {DefaultCrudRepository, repository} from '@loopback/repository';
import {MysqlDataSource} from '../datasources';
import {Category, CategoryRelations} from '../models';
import {ProductRepository} from './product.repository';

export class CategoryRepository extends DefaultCrudRepository<
  Category,
  typeof Category.prototype.id,
  CategoryRelations
> {
  constructor(
    @inject('datasources.mysql') dataSource: MysqlDataSource,
    @repository.getter('ProductRepository')
    protected productRepositoryGetter: Getter<ProductRepository>,
  ) {
    super(Category, dataSource);
  }

  async getCategoryByID(categoryId: number): Promise<Category> {
    const query = `SELECT id,code,name,description,active FROM store.categories WHERE id = ${categoryId} AND deleted = 0`;
    const category = (await this.execute(query))[0];
    category.active = category.active === 1;

    return <Category>category;
  }

  async getAllCategories(): Promise<Category[]> {
    const query = `SELECT id,code,name,description,active FROM store.categories WHERE deleted = 0 `;
    let result = <Category[]>await this.execute(query);
    result = result.map(el => new Category({...el, active: Number(el.active) === 1}));

    return result;
  }

  async getCategoriesByCodeOrName(code: string, name: string): Promise<Category[]> {
    const query = `SELECT id,code,name,description,active FROM store.categories WHERE deleted = 0 AND (code = ? OR name = ?) `;
    const result = <Category[]>await this.execute(query, [code, name]);

    return result;
  }

  async createCategory(category: Category): Promise<Category> {
    const query = `INSERT INTO store.categories SET code = ?, name = ?, description = ?, active = ? `;
    const {code, name, description, active} = category;
    const result = await this.execute(query, [code, name, description, active]);
    const newCategory = <Category>await this.getCategoryByID(result.insertId);

    return newCategory;
  }

  async updateCategory(categoryId: number, category: Category): Promise<void> {
    const query = 'UPDATE store.categories SET code = ?, name = ?, description = ?, active = ? WHERE id = ?';
    const {code, name, description, active} = category;
    await this.execute(query, [code, name, description, active, categoryId]);
  }

  async updateCategoryStatus(categoryId: number, status: boolean): Promise<void> {
    const query = 'UPDATE store.categories SET active = ? WHERE id = ?';
    await this.execute(query, [status, categoryId]);
  }

  async deleteCategory(categoryId: number): Promise<void> {
    const query = `UPDATE store.categories SET active = 0, deleted = 1 WHERE id = ${categoryId}`;

    await this.execute(query);
  }
}
