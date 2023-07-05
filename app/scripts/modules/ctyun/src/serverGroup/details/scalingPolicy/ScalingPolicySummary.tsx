import { Application, IServerGroup } from '@spinnaker/core';

import { IScalingPolicy } from 'ctyun/domain';

export interface IScalingPolicySummaryProps {
  policy: IScalingPolicy;
  serverGroup: IServerGroup;
  application: Application;
}
