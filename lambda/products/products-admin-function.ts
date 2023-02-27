import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { ProductRepository, ProductCreate, ProductUpdate } from "/opt/nodejs/products-layer";
import { DynamoDB } from "aws-sdk";

const productsDdb = process.env.PRODUCTS_DDB!;
const ddbClient = new DynamoDB.DocumentClient();
const productRepository = new ProductRepository(ddbClient, productsDdb);

export async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
  const lambdaRequestId = context.awsRequestId;
  const apiRequestId = event.requestContext.requestId;
  console.log(`API Gateway RequestId: ${apiRequestId} - Lambda RequestId: ${lambdaRequestId}`);
  if (event.resource === "/products") {
    console.log("POST /products");
    try {
      const productData = JSON.parse(event.body!) as ProductCreate;
      const productCreated = await productRepository.create(productData);
      return {
        statusCode: 201,
        body: JSON.stringify(productCreated),
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
    if (event.httpMethod === "PUT") {
      console.log(`PUT /products/${id}`);
      const productData = JSON.parse(event.body!) as ProductUpdate;
      try {
        const productUpdated = await productRepository.update(id, productData);
        return {
          statusCode: 200,
          body: JSON.stringify({
            message: JSON.stringify(productUpdated),
          }),
        };
      } catch (err: any) {
        const message = err.message;
        console.error(message);
        if (err.errorType === "ConditionalCheckFailedException") {
          return {
            statusCode: 404,
            body: JSON.stringify({ message }),
          };
        }
        return {
          statusCode: 500,
          body: JSON.stringify({ message }),
        };
      }
    } else if (event.httpMethod === "DELETE") {
      console.log(`DELETE /products/${id}`);
      try {
        const productDeleted = await productRepository.delete(id);
        if (!productDeleted) {
          console.error("Product not found");
          return {
            statusCode: 404,
            body: JSON.stringify({ message: "Product not found" }),
          };
        }
        return {
          statusCode: 200,
          body: JSON.stringify(productDeleted),
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
  }
  return {
    statusCode: 400,
    body: JSON.stringify({
      message: "Bad Request",
    }),
  };
}
