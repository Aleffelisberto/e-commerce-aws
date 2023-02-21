#!/usr/bin/env node
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

const productsApiStack = new ProductsAppStack(app, "ProductsApp", {
  tags,
  env,
});

const eCommerceApiStack = new ECommerceApiStack(app, "ECommerceApi", {
  productsFetchHandler: productsApiStack.productsFetchHandler,
  tags,
  env,
});
eCommerceApiStack.addDependency(productsApiStack);
