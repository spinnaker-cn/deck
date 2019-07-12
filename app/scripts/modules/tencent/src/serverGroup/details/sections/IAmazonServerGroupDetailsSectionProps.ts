import { IServerGroupDetailsSectionProps } from '@spinnaker/core';

import { IAmazonServerGroupView } from 'tencent/domain';

export interface IAmazonServerGroupDetailsSectionProps extends IServerGroupDetailsSectionProps {
  serverGroup: IAmazonServerGroupView;
}
