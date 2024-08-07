import { IController, IComponentOptions, module } from 'angular';

import { Application, IServerGroup } from '@spinnaker/core';

import { ScalingPolicyTypeRegistry } from './ScalingPolicyTypeRegistry';
import { IScalingPolicy } from 'ecloud/domain';

export class ScalingPolicyDetailsSummaryController implements IController {
  public templateUrl: string;
  public policy: IScalingPolicy;
  public serverGroup: IServerGroup;
  public application: Application;

  public $onInit() {
    const config = ScalingPolicyTypeRegistry.getPolicyConfig(this.policy.policyType);
    this.templateUrl = config ? config.summaryTemplateUrl : require('./alarmBasedSummary.template.html');
  }
}

export const scalingPolicyDetailsSummary: IComponentOptions = {
  bindings: {
    policy: '<',
    serverGroup: '<',
    application: '<',
  },
  controller: ScalingPolicyDetailsSummaryController,
  template: `<div ng-include src="$ctrl.templateUrl"></div>`,
};

export const DETAILS_SUMMARY = 'spinnaker.ecloud.scalingPolicy.details.summary.component';
module(DETAILS_SUMMARY, []).component('ecloudScalingPolicySummary', scalingPolicyDetailsSummary);
