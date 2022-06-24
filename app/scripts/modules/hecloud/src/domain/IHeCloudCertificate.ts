import { ICertificate } from '@spinnaker/core';

export interface IHeCloudCertificate extends ICertificate {
  arn: string;
  uploadDate: number;
}
