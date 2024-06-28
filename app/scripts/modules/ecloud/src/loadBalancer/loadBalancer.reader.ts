import { IPromise } from 'angular';

import { API } from '@spinnaker/core';

export interface IEcloudLoadBalancer {
  accounts: string;
  id: string;
  name: string;
  region: string;
  type: string;
  vpcId: string;
}

export class LoadBalancerReader {
  public static findLoadBalancer(params: { account: string; region: string, loadBalancerId: string }): IPromise<IEcloudLoadBalancer[]> {

    return API.one('loadBalancers')
      .withParams({ ...params, provider: 'ecloud' })
      .get()
      .catch(() => [] as IEcloudLoadBalancer[]);
  }

  public static getLoadBalancers(): IPromise<IEcloudLoadBalancer> {
    return API.one('loadBalancers')
      .withParams({ provider: 'ecloud' })
      .get()
      .then((results: any[]) => (results && results.length ? results[0] : null))
      .catch(() => [] as IEcloudLoadBalancer[]);
  }
}
