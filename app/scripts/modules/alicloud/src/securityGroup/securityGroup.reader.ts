

import { module } from 'angular';

import { ISecurityGroupsByAccount, ISecurityGroup } from '@spinnaker/core';

export class AlicloudSecurityGroupReader {
  public resolveIndexedSecurityGroup(
    indexedSecurityGroups: ISecurityGroupsByAccount,
    container: ISecurityGroup,
    securityGroupId: string,
  ): ISecurityGroup {
    return indexedSecurityGroups[container.account][container.region][securityGroupId];
  }
}

export const ALICLOUD_SECURITY_READER = 'spinnaker.alicloud.securityGroup.reader';
module(ALICLOUD_SECURITY_READER, []).service('alicloudSecurityGroupReader', AlicloudSecurityGroupReader);

