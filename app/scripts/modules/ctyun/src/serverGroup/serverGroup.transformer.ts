import { module, IPromise } from 'angular';

import { IVpc } from '@spinnaker/core';

import {
  IScalingAdjustmentView,
  IScalingPolicyView,
  IScalingPolicyAlarmView,
  IAmazonServerGroup,
  IScalingPolicy,
  IAmazonServerGroupView,
} from '../domain';
import { VpcReader } from '../vpc/VpcReader';

export class AwsServerGroupTransformer {
  private addComparator(alarm: IScalingPolicyAlarmView): void {
    if (!alarm || !alarm.comparisonOperator) {
      return;
    }
    switch (alarm.comparisonOperator) {
      case 'LESS_THAN':
        alarm.comparator = '&lt;';
        break;
      case 'GREATER_THAN':
        alarm.comparator = '&gt;';
        break;
      case 'LESS_THAN_OR_EQUAL_TO':
        alarm.comparator = '&le;';
        break;
      case 'GREATER_THAN_OR_EQUAL_TO':
        alarm.comparator = '&ge;';
        break;
    }
  }

  private addAdjustmentAttributes(policyOrStepAdjustment: IScalingAdjustmentView): void {
    policyOrStepAdjustment.operator = policyOrStepAdjustment.adjustmentValue < 0 ? 'decrease' : 'increase';
    policyOrStepAdjustment.absAdjustment = Math.abs(policyOrStepAdjustment.adjustmentValue);
  }

  public transformScalingPolicy(policy: IScalingPolicy): IScalingPolicyView {
    const view: IScalingPolicyView = { ...policy } as IScalingPolicyView;
    view.metricAlarm = policy.metricAlarm;
    this.addComparator(view.metricAlarm);
    this.addAdjustmentAttributes(view); // simple policies
    return view;
  }

  public normalizeServerGroupDetails(serverGroup: IAmazonServerGroup): IAmazonServerGroupView {
    const view: IAmazonServerGroupView = { ...serverGroup } as IAmazonServerGroupView;
    if (serverGroup.scalingPolicies) {
      view.scalingPolicies = serverGroup.scalingPolicies.map(policy => this.transformScalingPolicy(policy));
    }
    return view;
  }

  public normalizeServerGroup(serverGroup: IAmazonServerGroup): IPromise<IAmazonServerGroup> {
    serverGroup.instances.forEach(instance => {
      instance.vpcId = serverGroup.vpcId;
    });
    return VpcReader.listVpcs().then(vpc => this.addVpcNameToServerGroup(serverGroup)(vpc));
  }

  private addVpcNameToServerGroup(serverGroup: IAmazonServerGroup): (vpc: IVpc[]) => IAmazonServerGroup {
    return (vpcs: IVpc[]) => {
      const match = vpcs.find(test => test.id === serverGroup.vpcId);
      serverGroup.vpcName = match ? match.name : '';
      return serverGroup;
    };
  }

  public convertServerGroupCommandToDeployConfiguration(base: any): any {
    base.forwardLoadBalancers.forEach((item: any) => {
      item.lbID = item.loadBalancerId;
      item.port = item.targetAttributes && item.targetAttributes.length > 0 ? item.targetAttributes[0].port : '';
      item.weight = item.targetAttributes && item.targetAttributes.length > 0 ? item.targetAttributes[0].weight : '';
    });
    const command = {
      ...base,
      backingData: {},
      viewState: {},
      availabilityZones: {},
      type: base.type,
      cloudProvider: 'ctyun',
      application: base.application,
      account: base.credentials,
      accountName: base.credentials,
      region: base.region,
      securityGroupIds: base.securityGroups,
      recoveryMode: base.recoveryMode,
      stack: base.stack,
      detail: base.detail,
      healthMode: Number(base.healthMode),
      healthPeriod: Number(base.healthPeriod),
      // moveOutStrategy: Number(base.moveOutStrategy),
      terminationPolicies: base.terminationPolicies, // [Number(base.moveOutStrategy)], //
      mazInfoList: null,
      subnetIds: [],

      freeFormDetails: base.detail,
      strategy: base.strategy,

      imageId: base.imageId,
      instanceType: base.instanceType,
      instanceTypes: base.instanceTypes,
      // subnetIds: base.subnetIds,
      // subnetType: base.subnetIds.join(''),
      credentials: base.credentials,
      capacity: base.capacity, // for pipline deploy
      maxSize: base.capacity.max,
      minSize: base.capacity.min,
      desiredCapacity: base.capacity.desired,
      projectId: base.projectID,
      configID: '',
      useLb: 2,

      loginSettings: base.keyPair
        ? {
            loginMode: 2,
            keyIds: [base.keyPair],
          }
        : undefined,
      targetHealthyDeployPercentage: base.targetHealthyDeployPercentage,
      vpcId: base.vpcId,

      dataDisks: base.dataDisks,
      systemDisk: base.systemDisk,

      instanceTags: Object.keys(base.tags).map(tagKey => ({
        key: tagKey,
        value: base.tags[tagKey],
      })),
      internetAccessible: base.internetAccessible
        ? {
            internetChargeType: base.internetAccessible.internetChargeType,
            internetMaxBandwidthOut: base.internetAccessible.internetMaxBandwidthOut,
            publicIpAssigned: base.internetAccessible.publicIpAssigned,
          }
        : undefined,
      userData: base.userData ? btoa(base.userData) : undefined,
      defaultCooldown: base.cooldown,
      enhancedService: base.enhancedService,
      source: base.viewState && base.viewState.mode === 'clone' ? base.source : undefined,
      forwardLoadBalancers: base.forwardLoadBalancers,
    };

    if (base.optionZone.length > 1) {
      command.mazInfoList = base.mazInfoList;
      command.subnetIds = [];
    } else {
      command.mazInfoList = [];
      command.subnetIds = base.subnetIds;
      command.subnetType = base.subnetIds.join('');
    }
    if (command.internetAccessible && command.internetAccessible.publicIpAssigned == false) {
      delete command.internetAccessible.internetMaxBandwidthOut;
      delete command.internetAccessible.internetChargeType;
    }
    if (command.internetAccessible && command.internetAccessible.internetChargeType == 2) {
      delete command.internetAccessible.internetMaxBandwidthOut;
    }
    return command;
  }

  public constructNewStepScalingPolicyTemplate(): IScalingPolicy {
    return {
      triggerObj: {
        metricName: 'cpu_util',
        threshold: 10,
        statistics: 'avg',
        comparisonOperator: 'ge',
        evaluationCount: 1,
        period: '1m',
      },
      cooldown: 300,
      action: 1,
      operateUnit: 1,
      stepAdjustments: [
        {
          adjustmentValue: 1,
          metricIntervalLowerBound: 0,
        },
      ],
      estimatedInstanceWarmup: 600,
    };
  }
}

export const AWS_SERVER_GROUP_TRANSFORMER = 'spinnaker.ctyun.serverGroup.transformer';
module(AWS_SERVER_GROUP_TRANSFORMER, []).service('ctyunServerGroupTransformer', AwsServerGroupTransformer);
