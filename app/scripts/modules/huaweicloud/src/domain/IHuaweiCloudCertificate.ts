import { ICertificate } from '@spinnaker/core';

export interface IHuaweiCloudCertificate extends ICertificate {
  arn: string;
  uploadDate: number;
}
