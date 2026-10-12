
import * as cdk from "aws-cdk-lib";
import { ChessBeWsStack } from "../lib/chess-be-ws-stack";
import { CONFIG } from "../lib/config";

const app = new cdk.App();

new ChessBeWsStack(app, CONFIG.naming.stackName, {
  env: {
    account:
      CONFIG.aws.account ??
      process.env.CDK_DEFAULT_ACCOUNT,
    region:
      CONFIG.aws.region ??
      process.env.CDK_DEFAULT_REGION,
  },
});
