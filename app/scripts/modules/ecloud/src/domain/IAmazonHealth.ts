import { IHealth } from '@spinnaker/core';

import { ITargetGroup } from 'ecloud/domain';

export interface IAmazonHealth extends IHealth {
  targetGroups: ITargetGroup[];
}

export interface IEcloudHealthCheck {
  healthSwitch: number;
  timeOut: number;
  intervalTime: number;
  healthNum: number;
  unHealthNum: number;
  httpCode?: number;
  httpCheckPath?: string;
  httpCheckDomain?: string;
  httpCheckMethod?: string;
  showAdvancedSetting: boolean;
  [key: string]: any;
}
