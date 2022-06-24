import { IPromise } from 'angular';

import { API } from '@spinnaker/core';

export interface IHeCloudLoadBalancer {
  accounts: string;
  id: string;
  name: string;
  region: string;
  type: string;
  vpcId: string;
}

export class LoadBalancerReader {
  public static findLoadBalancer(params: {
    account: string;
    region: string;
    loadBalancerId: string;
  }): IPromise<IHeCloudLoadBalancer[]> {
    return API.one('loadBalancers')
      .withParams({ ...params, provider: 'hecloud' })
      .get()
      .catch(() => [] as IHeCloudLoadBalancer[]);
  }

  public static getLoadBalancers(): IPromise<IHeCloudLoadBalancer> {
    return API.one('loadBalancers')
      .withParams({ provider: 'hecloud' })
      .get()
      .then((results: any[]) => (results && results.length ? results[0] : null))
      .catch(() => [] as IHeCloudLoadBalancer[]);
  }
}
