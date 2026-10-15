const databaseUrl = process.env.DATABASE_URL ?? "";
const secretKey = process.env.SECRET_KEY ?? "";
const frontendUrl = process.env.FRONTEND_URL ?? "https://chess.gramo37.in";
const allowedHosts = process.env.ALLOWED_HOSTS ?? "http://localhost:5173,http://localhost:3000,http://localhost,https://chess.gramo37.in";

// Sidecar Redis in the same Fargate task. Do not copy REDIS_HOST from .env:
// that file points at ElastiCache, which this task does not use.
const redisHost = "127.0.0.1";
const redisPort = "6379";
const redisKey = "REDIS_KEY";
const redisDataKey = "data";

const BACKEND_IMAGE = "526955697352.dkr.ecr.us-east-1.amazonaws.com/chess/backend:latest";
const WS_IMAGE = "526955697352.dkr.ecr.us-east-1.amazonaws.com/chess/ws:latest";
const REDIS_IMAGE = "526955697352.dkr.ecr.us-east-1.amazonaws.com/chess/redis:latest";

const FRONTEND_DOMAIN = "chess.gramo37.in";
const BACKEND_DOMAIN = "chess-api.gramo37.in";

export const CONFIG = {
    aws: {
      region: "us-east-1",
      account: process.env.CDK_DEFAULT_ACCOUNT,
    },
  
    naming: {
      backendStackName: "chess-app-backend-stack",
      frontendStackName: "chess-app-frontend-stack",
      vpcName: "chess-app-vpc",
      clusterName: "chess-app-cluster",
      taskDefinitionName: "chess-app-task",
      serviceName: "chess-app-service",
      loadBalancerName: "chess-app-alb",
      apiTargetGroupName: "chess-app-api-tg",
      wsTargetGroupName: "chess-app-ws-tg",
      logGroupName: "/ecs/chess-app",
    },
  
    domain: {
      apiSubdomain: BACKEND_DOMAIN,
      frontendDomain: FRONTEND_DOMAIN,
    },

    networking: {
      maxAvailabilityZones: 2,
      natGateways: 0,
      assignPublicIp: true,
      albHttpPort: 80,
      albHttpsPort: 443,
    },
  
    service: {
      // Live games and matchmaking are stored in the WebSocket process.
      // A second task would pair players who cannot see each other.
      desiredCount: 1,
      minCapacity: 1,
      maxCapacity: 1,
      cpu: 1024,
      memoryLimitMiB: 2048,
      healthCheckGracePeriodSeconds: 90,
      // Chess games sit idle between moves. The ALB default of 60s drops them.
      albIdleTimeoutSeconds: 3600,
    },
  
    containers: {
      api: {
        name: "chess-app-api",
        image: BACKEND_IMAGE,
        // apps/backend listens on BACKEND_PORT. Dockerfile exposes 5000.
        port: 5000,
        healthCheckPath: "/health",
        environment: {
          DATABASE_URL: databaseUrl,
          BACKEND_PORT: "5000",
          SECRET_KEY: secretKey,
          FRONTEND_URL: frontendUrl,
          ALLOWED_HOSTS: allowedHosts,
          REDIS_HOST: redisHost,
          REDIS_PORT: redisPort,
          REDIS_TLS: "false",
          REDIS_KEY: redisKey,
          REDIS_DATA_KEY: redisDataKey,
        },
      },
  
      ws: {
        name: "chess-app-ws",
        image: WS_IMAGE,
        // apps/ws listens on WEBSOCKET_PORT. Dockerfile exposes 8000.
        port: 8000,
        healthCheckPath: "/health",
        environment: {
          DATABASE_URL: databaseUrl,
          WEBSOCKET_PORT: "8000",
          SECRET_KEY: secretKey,
          REDIS_HOST: redisHost,
          REDIS_PORT: redisPort,
          REDIS_KEY: redisKey,
          REDIS_DATA_KEY: redisDataKey,
        },
      },
  
      redis: {
        name: "chess-app-redis",
        image: REDIS_IMAGE,
        port: 6379,
        memoryLimitMiB: 384,
        environment: {},
      },
    },
  
    routing: {
      apiPath: "/api/*",
      // The client connects to /ws (not /ws/...). /ws/* does not match /ws.
      wsPath: "/ws*",
      apiPriority: 10,
      wsPriority: 20,
    },
  
    logs: {
      retentionDays: 7,
    },
  };