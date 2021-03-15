import { IProviderSettings, SETTINGS } from '@spinnaker/core';

export interface IClassicLaunchWhitelist {
  region: string;
  credentials: string;
}

export interface IHuaweiProviderSettings extends IProviderSettings {
  defaults: {
    account?: string;
    region?: string;
    subnetType?: string;
    vpc?: string;
  };
  defaultSecurityGroups?: string[];
  loadBalancers?: {
    inferInternalFlagFromSubnet: boolean;
    certificateTypes?: string[];
  };
  useAmiBlockDeviceMappings?: boolean;
  classicLaunchLockout?: number;
  classicLaunchWhitelist?: IClassicLaunchWhitelist[];
  metrics?: {
    customNamespaces?: string[];
  };
  minRootVolumeSize?: number;
  disableSpotPricing?: boolean;
}

export const HuaweiProviderSettings: IHuaweiProviderSettings = (SETTINGS.providers.huaweicloud as IHuaweiProviderSettings) || {
  defaults: {},
};
if (HuaweiProviderSettings) {
  HuaweiProviderSettings.resetToOriginal = SETTINGS.resetProvider('huaweicloud');
}
