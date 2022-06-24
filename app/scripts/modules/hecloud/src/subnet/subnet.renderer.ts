import { module } from 'angular';

import { IServerGroup } from '@spinnaker/core';

export class HeSubnetRenderer {
  public render(serverGroup: IServerGroup): string {
    return serverGroup.subnetType;
  }
}

export const SUBNET_RENDERER = 'spinnaker.hecloud.subnet.renderer';
module(SUBNET_RENDERER, []).service('hecloudSubnetRenderer', HeSubnetRenderer);
