import { IPromise } from 'angular';
import { $q } from 'ngimport';

import { API } from '@spinnaker/core';
export interface IHuaweiCloudImage {
  accounts: string[];
  imgIds: {
    [region: string]: string[];
  };
  attributes: {
    createdTime?: string;
    creationDate?: string;
    osPlatform: string;
  };
  imageName: string;
  tags: {
    [tag: string]: string;
  };
  tagsByImageId: {
    [imageId: string]: IHuaweiCloudImage['tags'];
  };
}

export class HuaweiImageReader {
  public findImages(params: { q: string; region?: string }): IPromise<IHuaweiCloudImage[]> {
    if (!params.q || params.q.length < 3) {
      return $q.when([{ message: 'Please enter at least 3 characters...', disabled: true }]) as any;
    }

    return API.one('images/find')
      .withParams({ ...params, provider: 'huaweicloud' })
      .get()
      .catch(() => [] as IHuaweiCloudImage[]);
  }

  public getImage(amiName: string, region: string, credentials: string): IPromise<IHuaweiCloudImage> {
    return API.one('images')
      .one(credentials)
      .one(region)
      .one(amiName)
      .withParams({ provider: 'huaweicloud' })
      .get()
      .then((results: any[]) => (results && results.length ? results[0] : null))
      .catch(() => null as IHuaweiCloudImage);
  }
}
