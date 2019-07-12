import IInjectorService = angular.auto.IInjectorService;

import { ReactInject } from '@spinnaker/core';

import { AwsServerGroupConfigurationService } from '../serverGroup/configure/serverGroupConfiguration.service';
import { AwsServerGroupTransformer } from '../serverGroup/serverGroup.transformer';
import { AwsLoadBalancerTransformer } from '../loadBalancer/loadBalancer.transformer';

// prettier-ignore
export class AwsReactInject extends ReactInject {
  public get tencentInstanceTypeService() { return this.$injector.get('tencentInstanceTypeService') as any; }
  public get tencentLoadBalancerTransformer() { return this.$injector.get('tencentLoadBalancerTransformer') as AwsLoadBalancerTransformer; }
  public get tencentServerGroupCommandBuilder() { return this.$injector.get('tencentServerGroupCommandBuilder') as any; }
  public get tencentServerGroupConfigurationService() { return this.$injector.get('tencentServerGroupConfigurationService') as AwsServerGroupConfigurationService; }
  public get tencentServerGroupTransformer() { return this.$injector.get('tencentServerGroupTransformer') as AwsServerGroupTransformer; }

  public initialize($injector: IInjectorService) {
    this.$injector = $injector;
  }
}

export const AwsReactInjector: AwsReactInject = new AwsReactInject();
