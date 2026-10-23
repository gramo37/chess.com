import * as cdk from "aws-cdk-lib";
import { ChessBeLightsailStack } from "../lib/chess-be-lightsail-stack";
import { LIGHTSAIL_CONFIG } from "../lib/lightsail-config";

// Deploy with: npx cdk deploy --app "npx tsx bin/cdk-lightsail.ts"
const app = new cdk.App();

new ChessBeLightsailStack(app, LIGHTSAIL_CONFIG.naming.stackName, {
  env: {
    account:
      LIGHTSAIL_CONFIG.aws.account ??
      process.env.CDK_DEFAULT_ACCOUNT,
    region:
      LIGHTSAIL_CONFIG.aws.region ??
      process.env.CDK_DEFAULT_REGION,
  },
});
