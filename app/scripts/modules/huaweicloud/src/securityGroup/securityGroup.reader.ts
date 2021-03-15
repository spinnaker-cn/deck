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

export const HUAWEICLOUD_SECURITY_GROUP_READER = 'spinnaker.huaweicloud.securityGroup.reader';
module(HUAWEICLOUD_SECURITY_GROUP_READER, []).service('huaweicloudSecurityGroupReader', AwsSecurityGroupReader);
