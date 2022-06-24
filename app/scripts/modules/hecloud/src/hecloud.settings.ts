// eslint-disable-next-line no-unused-vars
import { IProviderSettings, SETTINGS } from '@spinnaker/core';

export interface IClassicLaunchWhitelist {
  region: string;
  credentials: string;
}

export interface IHeProviderSettings extends IProviderSettings {
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

export const HeProviderSettings: IHeProviderSettings = (SETTINGS.providers.hecloud as IHeProviderSettings) || {
  defaults: {},
};
if (HeProviderSettings) {
  HeProviderSettings.resetToOriginal = SETTINGS.resetProvider('hecloud');
}
