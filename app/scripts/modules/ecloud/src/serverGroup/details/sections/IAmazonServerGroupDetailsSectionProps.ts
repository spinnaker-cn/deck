import { IServerGroupDetailsSectionProps } from '@spinnaker/core';

import { IAmazonServerGroupView } from 'ecloud/domain';

export interface IAmazonServerGroupDetailsSectionProps extends IServerGroupDetailsSectionProps {
  serverGroup: IAmazonServerGroupView;
}
