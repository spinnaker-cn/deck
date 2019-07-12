import { IPromise } from 'angular';
import { $q } from 'ngimport';

import { API } from '@spinnaker/core';
export interface ITencentSnapshot {
  diskSize: string;
  diskType: string;
  diskUsage: 'SYSTEM_DISK' | 'DATA_DISK';
  snapshotId: string;
}
export interface IAmazonImage {
  accounts: string[];
  amis: {
    [region: string]: string[];
  };
  imgIds: {
    [region: string]: string[];
  };
  attributes: {
    createdTime?: string;
    creationDate?: string;
    snapshotSet?: ITencentSnapshot[];
    osPlatform: string;
  };
  imageName: string;
  tags: {
    [tag: string]: string;
  };
  tagsByImageId: {
    [imageId: string]: IAmazonImage['tags'];
  };
}

export class AwsImageReader {
  public findImages(params: { q: string; region?: string }): IPromise<IAmazonImage[]> {
    if (!params.q || params.q.length < 3) {
      return $q.when([{ message: 'Please enter at least 3 characters...', disabled: true }]) as any;
    }

    return API.one('images/find')
      .withParams({ ...params, provider: 'tencent' })
      .get()
      .catch(() => [] as IAmazonImage[]);
  }

  public getImage(amiName: string, region: string, credentials: string): IPromise<IAmazonImage> {
    return API.one('images')
      .one(credentials)
      .one(region)
      .one(amiName)
      .withParams({ provider: 'tencent' })
      .get()
      .then((results: any[]) => (results && results.length ? results[0] : null))
      .catch(() => null as IAmazonImage);
  }
}
