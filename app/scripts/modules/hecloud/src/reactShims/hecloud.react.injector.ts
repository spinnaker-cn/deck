import IInjectorService = angular.auto.IInjectorService;

import { ReactInject } from '@spinnaker/core';

import { HeServerGroupConfigurationService } from '../serverGroup/configure/serverGroupConfiguration.service';
import { HeServerGroupTransformer } from '../serverGroup/serverGroup.transformer';
import { HeLoadBalancerTransformer } from '../loadBalancer/loadBalancer.transformer';

// prettier-ignore
export class HeReactInject extends ReactInject {
  public get hecloudInstanceTypeService() { return this.$injector.get('hecloudInstanceTypeService') as any; }
  public get hecloudLoadBalancerTransformer() { return this.$injector.get('hecloudLoadBalancerTransformer') as HeLoadBalancerTransformer; }
  public get hecloudServerGroupCommandBuilder() { return this.$injector.get('hecloudServerGroupCommandBuilder') as any; }
  public get hecloudServerGroupConfigurationService() { return this.$injector.get('hecloudServerGroupConfigurationService') as HeServerGroupConfigurationService; }
  public get hecloudServerGroupTransformer() { return this.$injector.get('hecloudServerGroupTransformer') as HeServerGroupTransformer; }

  public initialize($injector: IInjectorService) {
    this.$injector = $injector;
  }
}

export const HeReactInjector: HeReactInject = new HeReactInject();
