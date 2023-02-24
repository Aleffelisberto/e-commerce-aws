#!/usr/bin/env node
import { ProductsAppLayersStack } from "./../lib/productsAppLayers-stack";
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { ProductsAppStack } from "../lib/productsApp-stack";
import { ECommerceApiStack } from "../lib/ecommerceApi-stack";

const app = new cdk.App();

const env: cdk.Environment = {
  account: "207364053425",
  region: "us-east-1",
};

const tags = {
  cost: "ECommerce",
  team: "Alefsandler",
};

const productsAppLayersStack = new ProductsAppLayersStack(app, "ProductsAppLayers", { tags, env });

const productsAppStack = new ProductsAppStack(app, "ProductsApp", { tags, env });
productsAppStack.addDependency(productsAppLayersStack);

const eCommerceApiStack = new ECommerceApiStack(app, "ECommerceApi", {
  productsFetchHandler: productsAppStack.productsFetchHandler,
  productsAdminHandler: productsAppStack.productsAdminHandler,
  tags,
  env,
});
eCommerceApiStack.addDependency(productsAppStack);
