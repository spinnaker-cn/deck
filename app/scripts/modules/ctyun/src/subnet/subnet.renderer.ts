import { module, IPromise } from 'angular';
import { IServerGroup, SubnetReader } from '@spinnaker/core';

export class AwsSubnetRenderer {
  public render(serverGroup: IServerGroup): string {
    return serverGroup.subnetTableStr;
  }
}

export const SUBNET_RENDERER = 'spinnaker.ctyun.subnet.renderer';
module(SUBNET_RENDERER, []).service('ctyunSubnetRenderer', AwsSubnetRenderer);
