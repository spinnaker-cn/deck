import { IAccountDetails, IServerGroup, IAsg } from '@spinnaker/core';

import { ISuspendedProcess, IScalingPolicyView } from 'ctyun/domain';

import { IScalingPolicy } from './IScalingPolicy';

export interface IAmazonAsg extends IAsg {
  healthPeriod?: number;
  healthMode?: number;
  recoveryMode?: number;
  availabilityZones: string[];
  defaultCooldown: number;
  terminationPolicies: string[];
  enabledMetrics: Array<{ metric: string }>;
  vpczoneIdentifier?: string;
  suspendedProcesses?: ISuspendedProcess[];
  zoneSet?: string[];
  terminationPolicySet: string[];
  vpcID: string;
  subnetIDList: string[];
  instanceCount?: string;
  maxCount?: number;
  minCount?: number;
  securityGroupIDList?: string[];
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
  scalingGroupID?: number;
  name?: string;
  ruleID?: number;
  ruleType?: number;
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
  cooldown?: number;
  accountDetails?: IAccountDetails;
  scalingPolicies: IScalingPolicyView[];
  scheduledActions?: IScheduledAction[];
}
