import { IHealth } from '@spinnaker/core';

import { ITargetGroup } from 'huaweicloud/domain';

export interface IHuaweiCloudHealth extends IHealth {
  targetGroups: ITargetGroup[];
}

export interface IHuaweiCloudHealthCheck {
  healthSwitch: number;
  timeOut: number;
  maxRetries: number;
  intervalTime: number;
  httpCode?: number;
  httpCheckPath?: string;
  showAdvancedSetting: boolean;
  [key: string]: any;
}
