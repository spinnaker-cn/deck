'use strict';

const angular = require('angular');
import { FirewallLabels, InfrastructureCaches } from '@spinnaker/core';

export const ALICLOUD_SERVERGROUP_SECURITY_DIRECTIVE = 'spinnaker.alicloud.serverGroup.configure.securityGroupSelector.directive';
angular
  .module(ALICLOUD_SERVERGROUP_SECURITY_DIRECTIVE, [])
  .directive('alicloudServerGroupSecurityGroupsSelector', [
    'alicloudServerGroupConfigurationService',
    function(alicloudServerGroupConfigurationService: any) {
      return {
        restrict: 'E',
        scope: {
          command: '=',
        },
        templateUrl: require('./serverGroupSecurityGroupsSelector.directive.html'),
        link: function(scope: any) {
          scope.firewallLabel = FirewallLabels.get('firewall');
          scope.getSecurityGroupRefreshTime = function() {
            return InfrastructureCaches.get('securityGroups').getStats().ageMax;
          };

          scope.refreshSecurityGroups = function() {
            scope.refreshing = true;
            alicloudServerGroupConfigurationService.refreshSecurityGroups(scope.command).then(function() {
              scope.refreshing = false;
            });
          };
        },
      };
    },
  ]);
