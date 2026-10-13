
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as path from 'path';
import { CONFIG } from './config';

export interface FrontendStackProps extends cdk.StackProps {
  domainName: string;
}

export class ChessFeStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    props: cdk.StackProps,
  ) {
    super(scope, id, props);

    const domainName = CONFIG.domain.frontendDomain;

    // 1. ACM certificate for the frontend domain.
    // CloudFront certificates must be in us-east-1.
    const certificate = new acm.Certificate(
      this,
      'FrontendCertificate',
      {
        domainName,
        validation: acm.CertificateValidation.fromDns(),
      },
    );

    // 2. Private S3 bucket for the frontend build files.
    const frontendBucket = new s3.Bucket(
      this,
      'FrontendBucket',
      {
        blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
        encryption: s3.BucketEncryption.S3_MANAGED,
        enforceSSL: true,
        versioned: true,
        removalPolicy: cdk.RemovalPolicy.RETAIN,
      },
    );

    // 3. CloudFront distribution with private S3 access.
    const distribution = new cloudfront.Distribution(
      this,
      'FrontendDistribution',
      {
        domainNames: [domainName],
        certificate,

        defaultRootObject: 'index.html',

        defaultBehavior: {
          origin: origins.S3BucketOrigin.withOriginAccessControl(
            frontendBucket,
          ),
          viewerProtocolPolicy:
            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
          cachePolicy:
            cloudfront.CachePolicy.CACHING_OPTIMIZED,
          compress: true,
        },

        // Support client-side routing in React SPAs.
        errorResponses: [
          {
            httpStatus: 403,
            responseHttpStatus: 200,
            responsePagePath: '/index.html',
            ttl: cdk.Duration.seconds(0),
          },
          {
            httpStatus: 404,
            responseHttpStatus: 200,
            responsePagePath: '/index.html',
            ttl: cdk.Duration.seconds(0),
          },
        ],
      },
    );

    // 4. Deploy the generated frontend files to S3.
    new s3deploy.BucketDeployment(
      this,
      'DeployFrontend',
      {
        sources: [
          s3deploy.Source.asset(
            path.resolve(
              __dirname,
              '../../apps/frontend/dist',
            ),
          ),
        ],
        destinationBucket: frontendBucket,
        distribution,
        distributionPaths: ['/*'],
        prune: true,
      },
    );

    // Outputs.
    new cdk.CfnOutput(this, 'FrontendBucketName', {
      value: frontendBucket.bucketName,
    });

    new cdk.CfnOutput(this, 'CloudFrontDistributionId', {
      value: distribution.distributionId,
    });

    new cdk.CfnOutput(this, 'CloudFrontDomainName', {
      value: distribution.distributionDomainName,
    });

    new cdk.CfnOutput(this, 'FrontendURL', {
      value: `https://${domainName}`,
    });

    new cdk.CfnOutput(this, 'CertificateArn', {
      value: certificate.certificateArn,
    });
  }
}
