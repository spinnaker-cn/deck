'use strict';

import { module } from 'angular';

import { API } from '@spinnaker/core';

export class AlicloudImageReader {
  public findImages(params: any) {
    return API.one('images/find')
      .get(params)
      .then(
        function(results: any) {
          return results;
        },
        function(): any[] {
          return [];
        },
      );
  }

  public getImage(amiName: string, region: string, credentials: string) {
    return API.one('images')
      .one(credentials)
      .one(region)
      .one(amiName)
      .withParams({ provider: 'alicloud' })
      .get()
      .then(
        function(results: any) {
          return results && results.length ? results[0] : null;
        },
        function(): any {
          return null;
        },
      );
  }
}

export const ALICLOUD_IMAGE = 'spinnaker.alicloud.image.reader';
module(ALICLOUD_IMAGE, []).service('alicloudImageReader', AlicloudImageReader);
