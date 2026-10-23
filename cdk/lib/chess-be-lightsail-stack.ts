import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

import * as lightsail from "aws-cdk-lib/aws-lightsail";

import { LIGHTSAIL_CONFIG } from "./lightsail-config";

const { instance: INSTANCE, naming: NAMING } = LIGHTSAIL_CONFIG;

// Runs once on first boot. Changing this replaces the instance,
// so application config is delivered by the deploy workflow instead.
const userData = `#!/bin/bash
set -euxo pipefail

if [ ! -f /swapfile ]; then
  fallocate -l ${INSTANCE.swapSizeGb}G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

curl -fsSL https://get.docker.com | sh
usermod -aG docker ${INSTANCE.sshUser}
systemctl enable --now docker

apt-get install -y unattended-upgrades
dpkg-reconfigure -f noninteractive unattended-upgrades

mkdir -p ${INSTANCE.appDirectory}
chown ${INSTANCE.sshUser}:${INSTANCE.sshUser} ${INSTANCE.appDirectory}
`;

export class ChessBeLightsailStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const instance = new lightsail.CfnInstance(this, "BackendInstance", {
      instanceName: NAMING.instanceName,
      availabilityZone: INSTANCE.availabilityZone,
      blueprintId: INSTANCE.blueprintId,
      bundleId: INSTANCE.bundleId,
      keyPairName: INSTANCE.keyPairName,
      userData,
      networking: {
        ports: [
          { protocol: "tcp", fromPort: 22, toPort: 22 },
          { protocol: "tcp", fromPort: 80, toPort: 80 },
          { protocol: "tcp", fromPort: 443, toPort: 443 },
          // HTTP/3
          { protocol: "udp", fromPort: 443, toPort: 443 },
        ],
      },
    });

    const staticIp = new lightsail.CfnStaticIp(this, "BackendStaticIp", {
      staticIpName: NAMING.staticIpName,
      attachedTo: instance.ref,
    });

    new cdk.CfnOutput(this, "StaticIp", {
      value: staticIp.attrIpAddress,
      description: `GoDaddy A record target for ${LIGHTSAIL_CONFIG.domain.apiSubdomain}`,
    });

    new cdk.CfnOutput(this, "SshUser", {
      value: INSTANCE.sshUser,
    });

    new cdk.CfnOutput(this, "ApiBaseUrl", {
      value: `https://${LIGHTSAIL_CONFIG.domain.apiSubdomain}/api`,
    });

    new cdk.CfnOutput(this, "WebSocketUrl", {
      value: `wss://${LIGHTSAIL_CONFIG.domain.apiSubdomain}/ws`,
    });
  }
}
