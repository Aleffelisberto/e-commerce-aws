import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { v4 as uuid } from "uuid";

export interface Product {
  id: string;
  productName: string;
  code: string;
  price: number;
  model: string;
}

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
}
