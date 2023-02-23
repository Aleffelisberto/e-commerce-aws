import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";

export async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
  // getting variables for distributed tracing (logs)
  const lambdaRequestId = context.awsRequestId;
  const apiRequestId = event.requestContext.requestId;
  console.log(`API Gateway RequestId: ${apiRequestId} - Lambda RequestId: ${lambdaRequestId}`);
  if (event.resource === "/products") {
    console.log("GET /products");
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "GET products - OK",
      }),
    };
  } else if (event.resource === "/products/{id}") {
    const id = event.pathParameters!.id as string;
    console.log(`GET /products/${id}`);
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `GET /products/${id}`,
      }),
    };
  }
  return {
    statusCode: 400,
    body: JSON.stringify({
      message: "Bad Request",
    }),
  };
}
