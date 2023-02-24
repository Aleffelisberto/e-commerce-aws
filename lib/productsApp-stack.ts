import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodeJS from "aws-cdk-lib/aws-lambda-nodejs";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as ssm from "aws-cdk-lib/aws-ssm";

export class ProductsAppStack extends cdk.Stack {
  public readonly productsFetchHandler: lambdaNodeJS.NodejsFunction;
  public readonly productsAdminHandler: lambdaNodeJS.NodejsFunction;
  public readonly productsDdb: dynamodb.Table;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.productsDdb = new dynamodb.Table(this, "ProductsDdb", {
      tableName: "products",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      partitionKey: {
        name: "id",
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PROVISIONED,
      readCapacity: 1,
      writeCapacity: 1,
    });

    // Products Layer
    const productsLayerArn = ssm.StringParameter.valueForStringParameter(this, "ProductsLayerVersionArn");
    const productsLayer = lambda.LayerVersion.fromLayerVersionArn(this, "ProductsLayerVersionArn", productsLayerArn);

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
      environment: {
        PRODUCTS_DDB: this.productsDdb.tableName,
      },
      layers: [productsLayer],
    });
    this.productsDdb.grantReadData(this.productsFetchHandler);

    this.productsAdminHandler = new lambdaNodeJS.NodejsFunction(this, "productsAdminFunction", {
      functionName: "ProductsAdminFunction",
      entry: "lambda/products/products-admin-function.ts",
      handler: "handler",
      memorySize: 128, // in megabytes
      timeout: cdk.Duration.seconds(2),
      bundling: {
        minify: true,
        sourceMap: false,
      },
      environment: {
        PRODUCTS_DDB: this.productsDdb.tableName,
      },
      layers: [productsLayer],
    });
    this.productsDdb.grantWriteData(this.productsAdminHandler);
  }
}
