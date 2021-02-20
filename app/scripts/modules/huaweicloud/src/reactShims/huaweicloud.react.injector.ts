import IInjectorService = angular.auto.IInjectorService;

import { ReactInject } from '@spinnaker/core';

import { HuaweiServerGroupConfigurationService } from '../serverGroup/configure/serverGroupConfiguration.service';
import { HuaweiServerGroupTransformer } from '../serverGroup/serverGroup.transformer';
import { HuaweiLoadBalancerTransformer } from '../loadBalancer/loadBalancer.transformer';

// prettier-ignore
export class HuaweiReactInject extends ReactInject {
  public get huaweicloudInstanceTypeService() { return this.$injector.get('huaweicloudInstanceTypeService') as any; }
  public get huaweicloudLoadBalancerTransformer() { return this.$injector.get('huaweicloudLoadBalancerTransformer') as HuaweiLoadBalancerTransformer; }
  public get huaweicloudServerGroupCommandBuilder() { return this.$injector.get('huaweicloudServerGroupCommandBuilder') as any; }
  public get huaweicloudServerGroupConfigurationService() { return this.$injector.get('huaweicloudServerGroupConfigurationService') as HuaweiServerGroupConfigurationService; }
  public get huaweicloudServerGroupTransformer() { return this.$injector.get('huaweicloudServerGroupTransformer') as HuaweiServerGroupTransformer; }

  public initialize($injector: IInjectorService) {
    this.$injector = $injector;
  }
}

export const HuaweiReactInjector: HuaweiReactInject = new HuaweiReactInject();
