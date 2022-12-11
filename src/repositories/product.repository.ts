import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MysqlDataSource} from '../datasources';
import {Product, ProductRelations} from '../models';

export class ProductRepository extends DefaultCrudRepository<
  Product,
  typeof Product.prototype.id,
  ProductRelations
> {
  constructor(@inject('datasources.mysql') dataSource: MysqlDataSource) {
    super(Product, dataSource);
  }

  async getProductByID(productId: number): Promise<Product> {
    const query = `SELECT id,category_id categoryId,company_id companyId,code,name,description,brand,quantity,price FROM store.products WHERE id = ${productId} AND active = 1 AND deleted = 0`;
    const product = <Product>(await this.execute(query))[0];

    return product;
  }

  async createProduct(companyId: number, product: Product): Promise<Product> {
    const query = `INSERT INTO store.products SET category_id = ?, company_id = ?, code = ?, name = ?, description = ?, brand = ?, quantity = ?, price = ? `;
    const {
      categoryId,
      code,
      name,
      description,
      brand,
      quantity,
      price,
    } = product;
    const result = await this.execute(query, [
      categoryId,
      companyId,
      code,
      name,
      description,
      brand,
      quantity,
      price,
    ]);
    const newProduct = <Product>await this.getProductByID(result.insertId);

    return newProduct;
  }

  async updateProduct(productId: number, product: Product): Promise<void> {
    const query = 'UPDATE store.products SET category_id = ?, company_id = ?, code = ?, name = ?, description = ?, brand = ?, quantity = ?, price = ? WHERE id = ?';
    const {
      categoryId,
      companyId,
      code,
      name,
      description,
      brand,
      quantity,
      price,
    } = product;
    await this.execute(query, [
      categoryId,
      companyId,
      code,
      name,
      description,
      brand,
      quantity,
      price,
      productId,
    ]);
  }

  async deleteProduct(productId: number): Promise<void> {
    const query = `UPDATE store.products SET active = 0, deleted = 1 WHERE id = ${productId}`;

    await this.execute(query);
  }
}
