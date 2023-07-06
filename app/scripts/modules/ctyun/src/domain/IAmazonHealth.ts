import { IHealth } from '@spinnaker/core';

import { ITargetGroup } from 'ctyun/domain';

export interface IAmazonHealth extends IHealth {
  targetGroups: ITargetGroup[];
}

export interface ICtyunHealthCheck {
  healthSwitch: number;
  timeOut: number;
  intervalTime: number;
  healthNum: number;
  unHealthNum: number;
  httpCode?: String;
  httpCheckPath?: string;
  httpCheckDomain?: string;
  httpCheckMethod?: string;
  showAdvancedSetting: boolean;
  [key: string]: any;
}
