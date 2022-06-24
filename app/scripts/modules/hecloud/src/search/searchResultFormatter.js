'use strict';

const angular = require('angular');

import { VpcReader } from '../vpc/VpcReader';

module.exports = angular
  .module('spinnaker.hecloud.search.searchResultFormatter', [])
  .factory('hecloudSearchResultFormatter', function() {
    return {
      securityGroups: function(entry) {
        return VpcReader.getVpcName(entry.vpcId).then(function(vpcName) {
          let region = vpcName ? entry.region + ' - ' + vpcName.toLowerCase() : entry.region;
          return entry.name + ' (' + region + ')';
        });
      },
    };
  });
