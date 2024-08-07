import { IPromise } from 'angular';

import { IVpc, NetworkReader } from '@spinnaker/core';
export interface IEcloudVpc extends IVpc {
  isDefault?: boolean
}
export class VpcReader {
  private static cache: IPromise<IVpc[]>;

  public static listVpcs(): IPromise<IVpc[]> {
    if (this.cache) {
      return this.cache;
    }
    this.cache = NetworkReader.listNetworksByProvider('ecloud').then((vpcs: IVpc[]) => {
      return vpcs.map(vpc => {
        vpc.label = vpc.name;
        vpc.deprecated = !!vpc.deprecated;
        if (vpc.deprecated) {
          vpc.label += ' (deprecated)';
        }
        return vpc;
      });
    });
    return this.cache;
  }

  public static resetCache() {
    this.cache = null;
  }

  public static getVpcName(id: string) {
    return this.listVpcs().then(vpcs => {
      const match = vpcs.find(test => {
        return test.id === id;
      });
      return match ? match.name : null;
    });
  }
}
