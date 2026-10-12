
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as logs from "aws-cdk-lib/aws-logs";

import { CONFIG } from "./config";

function imageFromEcr(scope: Construct, id: string, imageUri: string): ecs.ContainerImage {
  const [repositoryUri, tag] = imageUri.split(":");
  const repositoryName = repositoryUri.split("/").slice(1).join("/");
  const repository = ecr.Repository.fromRepositoryName(scope, id, repositoryName);
  return ecs.ContainerImage.fromEcrRepository(repository, tag ?? "latest");
}

export class ChessBeWsStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    props?: cdk.StackProps,
  ) {
    super(scope, id, props);

    // --------------------------------------------------
    // 1. VPC
    // --------------------------------------------------

    const vpc = new ec2.Vpc(this, "ChessVpc", {
      vpcName: CONFIG.naming.vpcName,
      maxAzs: CONFIG.networking.maxAvailabilityZones,
      natGateways: CONFIG.networking.natGateways,

      subnetConfiguration: [
        {
          name: "public",
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        },
      ],
    });

    // --------------------------------------------------
    // 2. ECS Cluster
    // --------------------------------------------------

    const cluster = new ecs.Cluster(this, "ChessCluster", {
      clusterName: CONFIG.naming.clusterName,
      vpc,
      containerInsightsV2: ecs.ContainerInsights.ENABLED,
    });

    // --------------------------------------------------
    // 3. CloudWatch Log Group
    // --------------------------------------------------

    const logGroup = new logs.LogGroup(this, "ChessLogGroup", {
      logGroupName: CONFIG.naming.logGroupName,
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const createLogDriver = (streamPrefix: string) =>
      ecs.LogDrivers.awsLogs({
        logGroup,
        streamPrefix,
      });

    // --------------------------------------------------
    // 4. Fargate Task Definition
    // --------------------------------------------------

    const taskDefinition = new ecs.FargateTaskDefinition(
      this,
      "ChessTaskDefinition",
      {
        family: CONFIG.naming.taskDefinitionName,
        cpu: CONFIG.service.cpu,
        memoryLimitMiB: CONFIG.service.memoryLimitMiB,
      },
    );

    // API container: port 5000 (BACKEND_PORT)

    const apiContainer = taskDefinition.addContainer(
      "ApiContainer",
      {
        containerName: CONFIG.containers.api.name,
        image: imageFromEcr(this, "ApiRepository", CONFIG.containers.api.image),
        essential: true,
        memoryReservationMiB: 512,
        environment: {
          ...CONFIG.containers.api.environment,
        },
        logging: createLogDriver("api"),
      },
    );

    apiContainer.addPortMappings({
      containerPort: CONFIG.containers.api.port,
      protocol: ecs.Protocol.TCP,
    });

    // WebSocket container: port 8000 (WEBSOCKET_PORT)

    const wsContainer = taskDefinition.addContainer(
      "WebSocketContainer",
      {
        containerName: CONFIG.containers.ws.name,
        image: imageFromEcr(this, "WsRepository", CONFIG.containers.ws.image),
        essential: true,
        memoryReservationMiB: 512,
        environment: {
          ...CONFIG.containers.ws.environment,
        },
        logging: createLogDriver("websocket"),
      },
    );

    wsContainer.addPortMappings({
      containerPort: CONFIG.containers.ws.port,
      protocol: ecs.Protocol.TCP,
    });

    // Redis container: port 6379

    const redisContainer = taskDefinition.addContainer(
      "RedisContainer",
      {
        containerName: CONFIG.containers.redis.name,
        image: imageFromEcr(this, "RedisRepository", CONFIG.containers.redis.image),
        essential: true,
        memoryReservationMiB:
          CONFIG.containers.redis.memoryLimitMiB,
        memoryLimitMiB: CONFIG.containers.redis.memoryLimitMiB,
        environment: {
          ...CONFIG.containers.redis.environment,
        },
        logging: createLogDriver("redis"),
        command: [
          "redis-server",
          "--appendonly",
          "yes",
        ],
      },
    );

    redisContainer.addPortMappings({
      containerPort: CONFIG.containers.redis.port,
      protocol: ecs.Protocol.TCP,
    });

    // All containers share the task's network namespace.
    // API and WS connect to Redis at 127.0.0.1:6379.
    // for (const appContainer of [apiContainer, wsContainer]) {
    //   appContainer.addContainerDependencies({
    //     container: redisContainer,
    //     condition: ecs.ContainerDependencyCondition.START,
    //   });
    // }

    // --------------------------------------------------
    // 5. Security Groups
    // --------------------------------------------------

    const albSecurityGroup = new ec2.SecurityGroup(
      this,
      "AlbSecurityGroup",
      {
        vpc,
        description: "Public traffic to the Application Load Balancer",
        allowAllOutbound: true,
      },
    );

    albSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(CONFIG.networking.albHttpPort),
      "Allow HTTP traffic to ALB",
    );

    albSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(CONFIG.networking.albHttpsPort),
      "Allow HTTPS traffic to ALB",
    );

    const taskSecurityGroup = new ec2.SecurityGroup(
      this,
      "EcsTaskSecurityGroup",
      {
        vpc,
        description: "Allow application traffic only from the ALB",
        allowAllOutbound: true,
      },
    );

    taskSecurityGroup.addIngressRule(
      albSecurityGroup,
      ec2.Port.tcp(CONFIG.containers.api.port),
      "ALB to API",
    );

    taskSecurityGroup.addIngressRule(
      albSecurityGroup,
      ec2.Port.tcp(CONFIG.containers.ws.port),
      "ALB to WebSocket",
    );

    // No public ingress rule for Redis.

    // --------------------------------------------------
    // 6. Application Load Balancer
    // --------------------------------------------------

    const alb = new elbv2.ApplicationLoadBalancer(
      this,
      "ChessAlb",
      {
        loadBalancerName: CONFIG.naming.loadBalancerName,
        vpc,
        internetFacing: true,
        securityGroup: albSecurityGroup,
        vpcSubnets: {
          subnetType: ec2.SubnetType.PUBLIC,
        },
      },
    );

    alb.setAttribute(
      "idle_timeout.timeout_seconds",
      String(CONFIG.service.albIdleTimeoutSeconds),
    );

    // --------------------------------------------------
    // 7. Target Groups
    // --------------------------------------------------

    const apiTargetGroup = new elbv2.ApplicationTargetGroup(
      this,
      "ApiTargetGroup",
      {
        targetGroupName: CONFIG.naming.apiTargetGroupName,
        vpc,
        port: CONFIG.containers.api.port,
        protocol: elbv2.ApplicationProtocol.HTTP,
        targetType: elbv2.TargetType.IP,
        healthCheck: {
          enabled: true,
          path: CONFIG.containers.api.healthCheckPath,
          healthyHttpCodes: "200-399",
          interval: cdk.Duration.seconds(30),
          timeout: cdk.Duration.seconds(5),
          healthyThresholdCount: 2,
          unhealthyThresholdCount: 3,
        },
      },
    );

    const wsTargetGroup = new elbv2.ApplicationTargetGroup(
      this,
      "WebSocketTargetGroup",
      {
        targetGroupName: CONFIG.naming.wsTargetGroupName,
        vpc,
        port: CONFIG.containers.ws.port,
        protocol: elbv2.ApplicationProtocol.HTTP,
        targetType: elbv2.TargetType.IP,
        healthCheck: {
          enabled: true,
          path: CONFIG.containers.ws.healthCheckPath,
          healthyHttpCodes: "200-399",
          interval: cdk.Duration.seconds(30),
          timeout: cdk.Duration.seconds(5),
          healthyThresholdCount: 2,
          unhealthyThresholdCount: 3,
        },
      },
    );

    // --------------------------------------------------
    // 8. Certificate, HTTPS listener, and routing rules
    // --------------------------------------------------

    // DNS is hosted at GoDaddy, so the validation CNAME is added there by hand.
    // The ALB record already points chess-api.gramo37.in at this load balancer.
    const certificate = new acm.Certificate(this, "ApiCertificate", {
      domainName: CONFIG.domain.apiSubdomain,
      validation: acm.CertificateValidation.fromDns(),
    });

    const httpsListener = alb.addListener("HttpsListener", {
      port: CONFIG.networking.albHttpsPort,
      protocol: elbv2.ApplicationProtocol.HTTPS,
      certificates: [certificate],
      sslPolicy: elbv2.SslPolicy.RECOMMENDED_TLS,
      open: false,
      defaultTargetGroups: [apiTargetGroup],
    });

    httpsListener.addTargetGroups("ApiRoutingRule", {
      priority: CONFIG.routing.apiPriority,
      conditions: [
        elbv2.ListenerCondition.pathPatterns([
          CONFIG.routing.apiPath,
        ]),
      ],
      targetGroups: [apiTargetGroup],
    });

    httpsListener.addTargetGroups("WebSocketRoutingRule", {
      priority: CONFIG.routing.wsPriority,
      conditions: [
        elbv2.ListenerCondition.pathPatterns([
          CONFIG.routing.wsPath,
        ]),
      ],
      targetGroups: [wsTargetGroup],
    });

    alb.addListener("HttpListener", {
      port: CONFIG.networking.albHttpPort,
      protocol: elbv2.ApplicationProtocol.HTTP,
      open: false,
      defaultAction: elbv2.ListenerAction.redirect({
        protocol: "HTTPS",
        port: String(CONFIG.networking.albHttpsPort),
        permanent: true,
      }),
    });

    // --------------------------------------------------
    // 9. ECS Fargate Service
    // --------------------------------------------------

    const service = new ecs.FargateService(
      this,
      "ChessService",
      {
        serviceName: CONFIG.naming.serviceName,
        cluster,
        taskDefinition,
        desiredCount: CONFIG.service.desiredCount,

        assignPublicIp: CONFIG.networking.assignPublicIp,

        securityGroups: [taskSecurityGroup],

        vpcSubnets: {
          subnetType: ec2.SubnetType.PUBLIC,
        },

        healthCheckGracePeriod: cdk.Duration.seconds(
          CONFIG.service.healthCheckGracePeriodSeconds,
        ),

        minHealthyPercent: 50,
        maxHealthyPercent: 200,

        circuitBreaker: { rollback: true },

        enableExecuteCommand: true,
      },
    );

    // Register both application containers with the same service.
    // The two target groups are attached to the ALB listener above.

    service
      .loadBalancerTarget({
        containerName: CONFIG.containers.api.name,
        containerPort: CONFIG.containers.api.port,
      })
      .attachToApplicationTargetGroup(apiTargetGroup);

    service
      .loadBalancerTarget({
        containerName: CONFIG.containers.ws.name,
        containerPort: CONFIG.containers.ws.port,
      })
      .attachToApplicationTargetGroup(wsTargetGroup);

    // --------------------------------------------------
    // 10. Outputs
    // --------------------------------------------------

    new cdk.CfnOutput(this, "ClusterName", {
      value: cluster.clusterName,
    });

    new cdk.CfnOutput(this, "ServiceName", {
      value: service.serviceName,
    });

    new cdk.CfnOutput(this, "LoadBalancerDns", {
      value: alb.loadBalancerDnsName,
    });

    new cdk.CfnOutput(this, "ApiBaseUrl", {
      value: `https://${CONFIG.domain.apiSubdomain}${CONFIG.routing.apiPath.replace("*", "")}`,
    });

    new cdk.CfnOutput(this, "WebSocketUrl", {
      value: `wss://${CONFIG.domain.apiSubdomain}${CONFIG.routing.wsPath.replace("*", "")}`,
    });

    new cdk.CfnOutput(this, "CertificateArn", {
      value: certificate.certificateArn,
    });
  }
}
