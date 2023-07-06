import { IPromise } from 'angular';

import { API } from '@spinnaker/core';

export interface ICtyunLoadBalancer {
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
  }): IPromise<ICtyunLoadBalancer[]> {
    return API.one('loadBalancers')
      .withParams({ ...params, provider: 'ctyun' })
      .get()
      .catch(() => [] as ICtyunLoadBalancer[]);
  }

  public static getLoadBalancers(): IPromise<ICtyunLoadBalancer> {
    return API.one('loadBalancers')
      .withParams({ provider: 'ctyun' })
      .get()
      .then((results: any[]) => (results && results.length ? results[0] : null))
      .catch(() => [] as ICtyunLoadBalancer[]);
  }
}
