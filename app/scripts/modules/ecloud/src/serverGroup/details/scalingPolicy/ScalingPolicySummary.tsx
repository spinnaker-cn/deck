import { Application, IServerGroup } from '@spinnaker/core';

import { IScalingPolicy } from 'ecloud/domain';

export interface IScalingPolicySummaryProps {
  policy: IScalingPolicy;
  serverGroup: IServerGroup;
  application: Application;
}
