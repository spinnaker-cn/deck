'use strict';

import * as _ from 'lodash';

const angular = require('angular');

export const ALICLOUD_SERVERGROUP_IMAGE = 'spinnaker.alicloud.serverGroup.configure.basicSettings.image.filter'
angular
  .module( ALICLOUD_SERVERGROUP_IMAGE , [])
  .filter('regional', function() {
    return function(input: any, selectedRegion: any) {
      return _.filter(input, function(image: any) {
        return image.region === selectedRegion || image.region === null;
      });
    };
  });
