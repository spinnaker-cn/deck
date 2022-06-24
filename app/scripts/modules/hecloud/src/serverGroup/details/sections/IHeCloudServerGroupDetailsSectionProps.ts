import { IServerGroupDetailsSectionProps } from '@spinnaker/core';

import { IHeCloudServerGroupView } from 'hecloud/domain';

export interface IHeCloudServerGroupDetailsSectionProps extends IServerGroupDetailsSectionProps {
  serverGroup: IHeCloudServerGroupView;
}
