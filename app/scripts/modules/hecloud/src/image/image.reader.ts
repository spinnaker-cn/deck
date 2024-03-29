import { IPromise } from 'angular';
import { $q } from 'ngimport';

import { API } from '@spinnaker/core';
export interface IHeCloudImage {
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
    [imageId: string]: IHeCloudImage['tags'];
  };
}

export class HeImageReader {
  public findImages(params: { q: string; region?: string }): IPromise<IHeCloudImage[]> {
    if (!params.q || params.q.length < 3) {
      return $q.when([{ message: 'Please enter at least 3 characters...', disabled: true }]) as any;
    }

    return API.one('images/find')
      .withParams({ ...params, provider: 'hecloud' })
      .get()
      .catch(() => [] as IHeCloudImage[]);
  }

  public getImage(amiName: string, region: string, credentials: string): IPromise<IHeCloudImage> {
    return API.one('images')
      .one(credentials)
      .one(region)
      .one(amiName)
      .withParams({ provider: 'hecloud' })
      .get()
      .then((results: any[]) => (results && results.length ? results[0] : null))
      .catch(() => null as IHeCloudImage);
  }
}
