'use strict';

const angular = require('angular');

export const ALICLOUD_SERVERGROUP_LOADBALACNER_DIRECTIVE = 'spinnaker.alicloud.serverGroup.configure.loadBalancer.directive';
angular
  .module(ALICLOUD_SERVERGROUP_LOADBALACNER_DIRECTIVE, [])
  .directive('alicloudServerGroupLoadBalancersSelector', [
    'alicloudServerGroupConfigurationService',
    function() {
      return {
        restrict: 'E',
        scope: {
          command: '=',
        },
        templateUrl: require('./serverGroupLoadBalancersSelector.directive.html'),
      };
    },
  ]);


