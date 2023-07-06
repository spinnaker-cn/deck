import { IInstance } from '@spinnaker/core';

export interface IAmazonInstance extends IInstance {
  instanceIdStr?: any;
  targetGroups?: string[];
}
