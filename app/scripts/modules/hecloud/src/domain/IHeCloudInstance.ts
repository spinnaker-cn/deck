import { IInstance } from '@spinnaker/core';

export interface IHeCloudInstance extends IInstance {
  targetGroups?: string[];
}
