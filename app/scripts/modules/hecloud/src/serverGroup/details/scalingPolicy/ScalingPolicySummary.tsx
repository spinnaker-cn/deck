import { Application, IServerGroup } from '@spinnaker/core';

import { IScalingPolicy } from 'hecloud/domain';

export interface IScalingPolicySummaryProps {
  policy: IScalingPolicy;
  serverGroup: IServerGroup;
  application: Application;
}
