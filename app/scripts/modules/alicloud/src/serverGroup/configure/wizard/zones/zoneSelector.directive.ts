'use strict';

const angular = require('angular');

export const ALICLOUD_SERVERGROUP_ZONE_DIRECTIVE = 'spinnaker.alicloud.serverGroup.configure.wizard.capacity.zone.directive';
angular
  .module(ALICLOUD_SERVERGROUP_ZONE_DIRECTIVE, [])
  .directive('alicloudZoneSelector', function() {
    return {
      restrict: 'E',
      templateUrl: require('./zoneSelector.directive.html'),
      scope: {},
      bindToController: {
        command: '=',
      },
      controllerAs: 'vm',
      controller: [
        '$scope',
        function($scope: any) {
          this.updateEnableInboundNAT = () => {
            if ($scope.vm.command.zonesEnabled) {
              $scope.vm.command.enableInboundNAT = false;
            }
          };
        },
      ],
    };
  });
