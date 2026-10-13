
import * as cdk from "aws-cdk-lib";
import { ChessBeWsStack } from "../lib/chess-be-ws-stack";
import { CONFIG } from "../lib/config";
import { ChessFeStack } from "../lib/chess-fe-stack";

const app = new cdk.App();

new ChessBeWsStack(app, CONFIG.naming.backendStackName, {
  env: {
    account:
      CONFIG.aws.account ??
      process.env.CDK_DEFAULT_ACCOUNT,
    region:
      CONFIG.aws.region ??
      process.env.CDK_DEFAULT_REGION,
  },
});

new ChessFeStack(app, CONFIG.naming.frontendStackName, {
  env: {
    account:
      CONFIG.aws.account ??
      process.env.CDK_DEFAULT_ACCOUNT,
    region:
      CONFIG.aws.region ??
      process.env.CDK_DEFAULT_REGION,
  },
});