import { IAccountDetails, IServerGroup, IAsg } from '@spinnaker/core';

import { ISuspendedProcess, IScalingPolicyView } from 'tencent/domain';

import { IScalingPolicy } from './IScalingPolicy';

export interface IAmazonAsg extends IAsg {
  availabilityZones: string[];
  defaultCooldown: number;
  terminationPolicies: string[];
  enabledMetrics: Array<{ metric: string }>;
  vpczoneIdentifier?: string;
  suspendedProcesses?: ISuspendedProcess[];
  zoneSet?: string[];
  terminationPolicySet: string[];
  vpcId: string;
  subnetIdSet: string[];
  instanceCount?: string;
}

export interface IAmazonServerGroup extends IServerGroup {
  image?: any;
  scalingPolicies?: IScalingPolicy[];
  targetGroups?: string[];
  asg: IAmazonAsg;
  accountName?: string;
  instanceCount?: number;
}

export interface IScheduledAction {
  scheduledActionId?: string;
  scheduledActionName?: string;
  startTime?: string;
  endTime?: string;
  recurrence: number;
  minSize: number;
  maxSize: number;
  desiredCapacity: number;
}

export interface IAmazonServerGroupView extends IAmazonServerGroup {
  accountDetails?: IAccountDetails;
  scalingPolicies: IScalingPolicyView[];
  scheduledActions?: IScheduledAction[];
}
