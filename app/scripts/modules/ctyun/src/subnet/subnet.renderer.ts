import { module, IPromise } from 'angular';
import { IServerGroup, SubnetReader } from '@spinnaker/core';

export class AwsSubnetRenderer {
  private cache: any = [];
  constructor() {
    SubnetReader.listSubnetsByProvider('ctyun').then(subnet => {
      this.cache = subnet;
    });
  }

  public render(serverGroup: IServerGroup): string {
    let str = '';
    if (serverGroup.mazInfoList) {
      serverGroup.mazInfoList.map(maz => {
        if (str != '') {
          str += ',';
        }
        if (maz.masterId) {
          if (this.cache) {
            str += this.cache.find(sub => sub.id == maz.masterId).name || '';
          } else {
            str += maz.masterId;
          }
        }
        if (str != '') {
          str += ',';
        }
        if (maz.optionId) {
          if (this.cache) {
            str += this.cache.find(sub => sub.id == maz.optionId).name || '';
          } else {
            str += maz.optionId;
          }
        }
      });
    }
    return str;
  }
}

export const SUBNET_RENDERER = 'spinnaker.ctyun.subnet.renderer';
module(SUBNET_RENDERER, []).service('ctyunSubnetRenderer', AwsSubnetRenderer);
