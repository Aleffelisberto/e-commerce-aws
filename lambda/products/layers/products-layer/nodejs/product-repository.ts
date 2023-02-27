import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { v4 as uuid } from "uuid";

export interface Product {
  id: string;
  productName: string;
  code: string;
  price: number;
  model: string;
}

export type ProductCreate = Omit<Product, "id">;
export type ProductUpdate = Partial<ProductCreate>;

export class ProductRepository {
  private ddbClient: DocumentClient;
  private productsDdb: string;

  constructor(ddbClient: DocumentClient, productsDdb: string) {
    this.ddbClient = ddbClient;
    this.productsDdb = productsDdb;
  }

  async findAll(): Promise<Product[]> {
    const data = await this.ddbClient.scan({ TableName: this.productsDdb }).promise();
    return data.Items as Product[];
  }

  async findById(id: string): Promise<Product | undefined> {
    const data = await this.ddbClient.get({ TableName: this.productsDdb, Key: { id } }).promise();
    return (data.Item as Product) || undefined;
  }

  async create(product: ProductCreate): Promise<Product> {
    const productData = { ...product, id: uuid() };
    await this.ddbClient
      .put({
        TableName: this.productsDdb,
        Item: productData,
      })
      .promise();
    return productData;
  }

  async delete(id: string): Promise<Product | undefined> {
    const product = await this.ddbClient
      .delete({
        TableName: this.productsDdb,
        Key: { id },
        ReturnValues: "ALL_OLD",
      })
      .promise();
    return (product.Attributes as Product) || undefined;
  }

  async update(id: string, product: ProductUpdate): Promise<Product | Error> {
    try {
      const data = await this.ddbClient
        .update({
          TableName: this.productsDdb,
          Key: { id },
          ConditionExpression: "attribute_exists(id)",
          ReturnValues: "UPDATED_NEW",
          UpdateExpression: "set productName = :n, code = :c, price = :p, model = :m",
          ExpressionAttributeValues: {
            ":n": product.productName,
            ":c": product.code,
            ":p": product.price,
            ":m": product.model,
          },
        })
        .promise();
      return { ...data.Attributes, id } as Product;
    } catch (err: unknown) {
      return err as Error;
    }
  }
}
