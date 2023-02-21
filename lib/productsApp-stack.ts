import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodeJS from "aws-cdk-lib/aws-lambda-nodejs";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

export class ProductsAppStack extends cdk.Stack {
  public readonly productsFetchHandler: lambdaNodeJS.NodejsFunction;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.productsFetchHandler = new lambdaNodeJS.NodejsFunction(this, "productsFetchFunction", {
      functionName: "ProductsFetchFunction",
      entry: "lambda/products/products-fetch-function.ts",
      handler: "handler",
      memorySize: 128, // in megabytes
      timeout: cdk.Duration.seconds(2),
      bundling: {
        minify: true,
        sourceMap: false,
      },
    });
  }
}
