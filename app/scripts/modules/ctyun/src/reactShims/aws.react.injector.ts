import IInjectorService = angular.auto.IInjectorService;

import { ReactInject } from '@spinnaker/core';

import { AwsServerGroupConfigurationService } from '../serverGroup/configure/serverGroupConfiguration.service';
import { AwsServerGroupTransformer } from '../serverGroup/serverGroup.transformer';
import { AwsLoadBalancerTransformer } from '../loadBalancer/loadBalancer.transformer';

// prettier-ignore
export class AwsReactInject extends ReactInject {
  public get ctyunInstanceTypeService() { return this.$injector.get('ctyunInstanceTypeService') as any; }
  public get ctyunLoadBalancerTransformer() { return this.$injector.get('ctyunLoadBalancerTransformer') as AwsLoadBalancerTransformer; }
  public get ctyunServerGroupCommandBuilder() { return this.$injector.get('ctyunServerGroupCommandBuilder') as any; }
  public get ctyunServerGroupConfigurationService() { return this.$injector.get('ctyunServerGroupConfigurationService') as AwsServerGroupConfigurationService; }
  public get ctyunServerGroupTransformer() { return this.$injector.get('ctyunServerGroupTransformer') as AwsServerGroupTransformer; }

  public initialize($injector: IInjectorService) {
    this.$injector = $injector;
  }
}

export const AwsReactInjector: AwsReactInject = new AwsReactInject();
