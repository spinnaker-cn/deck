'use strict';

const angular = require('angular');

export const ALICLOUD_SECURITY_TRANSFORMER  = 'spinnaker.alicloud.securityGroup.transformer';
angular
  .module(ALICLOUD_SECURITY_TRANSFORMER, [])
  .factory('alicloudSecurityGroupTransformer', function() {
    function normalizeSecurityGroup() {}

    return {
      normalizeSecurityGroup: normalizeSecurityGroup,
    };
  });
