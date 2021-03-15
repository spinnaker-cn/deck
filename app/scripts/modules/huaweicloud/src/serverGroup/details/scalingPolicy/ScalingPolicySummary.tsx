import { Application, IServerGroup } from '@spinnaker/core';

import { IScalingPolicy } from 'huaweicloud/domain';

export interface IScalingPolicySummaryProps {
  policy: IScalingPolicy;
  serverGroup: IServerGroup;
  application: Application;
}
