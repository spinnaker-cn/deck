import { IServerGroupDetailsSectionProps } from '@spinnaker/core';

import { IHuaweiCloudServerGroupView } from 'huaweicloud/domain';

export interface IHuaweiCloudServerGroupDetailsSectionProps extends IServerGroupDetailsSectionProps {
  serverGroup: IHuaweiCloudServerGroupView;
}
