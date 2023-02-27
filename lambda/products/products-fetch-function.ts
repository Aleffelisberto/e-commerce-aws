import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { ProductRepository } from "/opt/nodejs/products-layer";
import { DynamoDB } from "aws-sdk";

const productsDdb = process.env.PRODUCTS_DDB!;
const ddbClient = new DynamoDB.DocumentClient();
const productRepository = new ProductRepository(ddbClient, productsDdb);

export async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
  // getting variables for distributed tracing (logs)
  const lambdaRequestId = context.awsRequestId;
  const apiRequestId = event.requestContext.requestId;
  console.log(`API Gateway RequestId: ${apiRequestId} - Lambda RequestId: ${lambdaRequestId}`);
  if (event.resource === "/products") {
    console.log("GET /products");
    try {
      const products = await productRepository.findAll();
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: JSON.stringify(products),
        }),
      };
    } catch (err: unknown) {
      const message = (<Error>err).message;
      console.error(message);
      return {
        statusCode: 500,
        body: JSON.stringify({ message }),
      };
    }
  } else if (event.resource === "/products/{id}") {
    const id = event.pathParameters!.id as string;
    console.log(`GET /products/${id}`);
    try {
      const product = await productRepository.findById(id);
      if (!product) {
        console.error("Product not found");
        return {
          statusCode: 404,
          body: "Product not found",
        };
      }
      return {
        statusCode: 200,
        body: JSON.stringify({ message: product }),
      };
    } catch (err: unknown) {
      const message = (<Error>err).message;
      console.error(message);
      return {
        statusCode: 500,
        body: JSON.stringify({ message }),
      };
    }
  }
  return {
    statusCode: 400,
    body: JSON.stringify({
      message: "Bad Request",
    }),
  };
}
