'use strict';

const angular = require('angular');

export const ALICLOUD_SERVERGROUP_NETWORKSETTING_DIRECTIVE = 'spinnaker.alicloud.serverGroup.configure.networkSettings.directive';
angular
  .module(ALICLOUD_SERVERGROUP_NETWORKSETTING_DIRECTIVE, [])
  .directive('alicloudServerGroupNetworkSettingsSelector', function() {
    return {
      restrict: 'E',
      scope: {
        command: '=',
      },
      templateUrl: require('./ServerGroupNetworkSettingsSelector.directive.html'),
    };
  });
