import { module } from 'angular';

import { ISecurityGroupsByAccount, ISecurityGroup } from '@spinnaker/core';

export class AwsSecurityGroupReader {
  public resolveIndexedSecurityGroup(
    indexedSecurityGroups: ISecurityGroupsByAccount,
    container: ISecurityGroup,
    securityGroupId: string,
  ): ISecurityGroup {
    return indexedSecurityGroups[container.account][container.region][securityGroupId];
  }
}

export const HECLOUD_SECURITY_GROUP_READER = 'spinnaker.hecloud.securityGroup.reader';
module(HECLOUD_SECURITY_GROUP_READER, []).service('hecloudSecurityGroupReader', AwsSecurityGroupReader);
