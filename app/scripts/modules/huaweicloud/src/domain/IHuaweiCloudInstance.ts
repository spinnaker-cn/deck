import { IInstance } from '@spinnaker/core';

export interface IHuaweiCloudInstance extends IInstance {
  targetGroups?: string[];
}
