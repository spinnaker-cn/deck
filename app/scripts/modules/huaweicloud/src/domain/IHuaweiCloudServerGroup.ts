import { IAccountDetails, IServerGroup, IAsg } from '@spinnaker/core';

import { ISuspendedProcess, IScalingPolicyView } from 'huaweicloud/domain';

import { IScalingPolicy } from './IScalingPolicy';

export interface IHuaweiCloudAsg extends IAsg {
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

export interface IHuaweiCloudServerGroup extends IServerGroup {
  image?: any;
  scalingPolicies?: IScalingPolicy[];
  targetGroups?: string[];
  asg: IHuaweiCloudAsg;
  accountName?: string;
  instanceCount?: number;
}

export interface IHuaweiCloudServerGroupView extends IHuaweiCloudServerGroup {
  accountDetails?: IAccountDetails;
  scalingPolicies: IScalingPolicyView[];
}
