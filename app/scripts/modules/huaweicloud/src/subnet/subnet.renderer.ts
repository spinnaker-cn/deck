import { module } from 'angular';

import { IServerGroup } from '@spinnaker/core';

export class HuaweiSubnetRenderer {
  public render(serverGroup: IServerGroup): string {
    return serverGroup.subnetType;
  }
}

export const SUBNET_RENDERER = 'spinnaker.huaweicloud.subnet.renderer';
module(SUBNET_RENDERER, []).service('huaweicloudSubnetRenderer', HuaweiSubnetRenderer);
