import { IPromise } from 'angular';

import { API } from '@spinnaker/core';

export interface IHuaweiCloudLoadBalancer {
  accounts: string;
  id: string;
  name: string;
  region: string;
  type: string;
  vpcId: string;
}

export class LoadBalancerReader {
  public static findLoadBalancer(params: { account: string; region: string, loadBalancerId: string }): IPromise<IHuaweiCloudLoadBalancer[]> {

    return API.one('loadBalancers')
      .withParams({ ...params, provider: 'huaweicloud' })
      .get()
      .catch(() => [] as IHuaweiCloudLoadBalancer[]);
  }

  public static getLoadBalancers(): IPromise<IHuaweiCloudLoadBalancer> {
    return API.one('loadBalancers')
      .withParams({ provider: 'huaweicloud' })
      .get()
      .then((results: any[]) => (results && results.length ? results[0] : null))
      .catch(() => [] as IHuaweiCloudLoadBalancer[]);
  }
}
