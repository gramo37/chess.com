import { CONFIG } from "./config";

export const LIGHTSAIL_CONFIG = {
  aws: CONFIG.aws,

  naming: {
    stackName: "chess-app-backend-lightsail-stack",
    instanceName: "chess-app-backend",
    staticIpName: "chess-app-backend-ip",
  },

  domain: CONFIG.domain,

  instance: {
    availabilityZone: "us-east-1a",
    blueprintId: "ubuntu_24_04",
    // micro_3_0: 1 GB RAM, 2 vCPU, 40 GB SSD, public IPv4, $7/month.
    // small_3_0 (2 GB, $12/month) if memory gets tight.
    bundleId: "micro_3_0",
    // Unset uses the region's Lightsail default key pair.
    keyPairName: undefined as string | undefined,
    sshUser: "ubuntu",
    appDirectory: "/opt/chess",
    swapSizeGb: 2,
  },
};
