'use strict';

const angular = require('angular');

import { VpcReader } from '../vpc/VpcReader';

module.exports = angular
  .module('spinnaker.ecloud.search.searchResultFormatter', [])
  .factory('ecloudSearchResultFormatter', function() {
    return {
      securityGroups: function(entry) {
        return VpcReader.getVpcName(entry.vpcId).then(function(vpcName) {
          let region = vpcName ? entry.region + ' - ' + vpcName.toLowerCase() : entry.region;
          return entry.name + ' (' + region + ')';
        });
      },
    };
  });
