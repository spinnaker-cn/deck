import { module } from 'angular';

import { IServerGroup } from '@spinnaker/core';

export class AwsSubnetRenderer {
  public render(serverGroup: IServerGroup): string {
    return serverGroup.subnetType;
  }
}

export const SUBNET_RENDERER = 'spinnaker.ecloud.subnet.renderer';
module(SUBNET_RENDERER, []).service('ecloudSubnetRenderer', AwsSubnetRenderer);
