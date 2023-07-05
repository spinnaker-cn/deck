import { IServerGroupDetailsSectionProps } from '@spinnaker/core';

import { IAmazonServerGroupView } from 'ctyun/domain';

export interface IAmazonServerGroupDetailsSectionProps extends IServerGroupDetailsSectionProps {
  serverGroup: IAmazonServerGroupView;
}
