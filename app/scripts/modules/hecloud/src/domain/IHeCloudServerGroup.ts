import { IAccountDetails, IServerGroup, IAsg } from '@spinnaker/core';

import { ISuspendedProcess, IScalingPolicyView } from 'hecloud/domain';

import { IScalingPolicy } from './IScalingPolicy';

export interface IHeCloudAsg extends IAsg {
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

export interface IHeCloudServerGroup extends IServerGroup {
  image?: any;
  scalingPolicies?: IScalingPolicy[];
  targetGroups?: string[];
  asg: IHeCloudAsg;
  accountName?: string;
  instanceCount?: number;
}

export interface IHeCloudServerGroupView extends IHeCloudServerGroup {
  accountDetails?: IAccountDetails;
  scalingPolicies: IScalingPolicyView[];
}
