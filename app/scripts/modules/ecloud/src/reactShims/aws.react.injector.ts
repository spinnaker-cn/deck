import IInjectorService = angular.auto.IInjectorService;

import { ReactInject } from '@spinnaker/core';

import { AwsServerGroupConfigurationService } from '../serverGroup/configure/serverGroupConfiguration.service';
import { AwsServerGroupTransformer } from '../serverGroup/serverGroup.transformer';
import { AwsLoadBalancerTransformer } from '../loadBalancer/loadBalancer.transformer';

// prettier-ignore
export class AwsReactInject extends ReactInject {
  public get ecloudInstanceTypeService() { return this.$injector.get('ecloudInstanceTypeService') as any; }
  public get ecloudLoadBalancerTransformer() { return this.$injector.get('ecloudLoadBalancerTransformer') as AwsLoadBalancerTransformer; }
  public get ecloudServerGroupCommandBuilder() { return this.$injector.get('ecloudServerGroupCommandBuilder') as any; }
  public get ecloudServerGroupConfigurationService() { return this.$injector.get('ecloudServerGroupConfigurationService') as AwsServerGroupConfigurationService; }
  public get ecloudServerGroupTransformer() { return this.$injector.get('ecloudServerGroupTransformer') as AwsServerGroupTransformer; }

  public initialize($injector: IInjectorService) {
    this.$injector = $injector;
  }
}

export const AwsReactInjector: AwsReactInject = new AwsReactInject();
