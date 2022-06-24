import { IHealth } from '@spinnaker/core';

import { ITargetGroup } from 'hecloud/domain';

export interface IHeCloudHealth extends IHealth {
  targetGroups: ITargetGroup[];
}

export interface IHeCloudHealthCheck {
  healthSwitch: number;
  timeOut: number;
  maxRetries: number;
  intervalTime: number;
  httpCode?: number;
  httpCheckPath?: string;
  showAdvancedSetting: boolean;
  [key: string]: any;
}
