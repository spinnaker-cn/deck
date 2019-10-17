'use strict';

const angular = require('angular');

import { ModalWizard } from '@spinnaker/core';

export const ALICLOUD_SERVERGROUP_NETWORKSETTING = 'spinnaker.alicloud.serverGroup.configure.networkSettings.controller';
angular
  .module(ALICLOUD_SERVERGROUP_NETWORKSETTING, [])
  .controller('alicloudServerGroupNetworkSettingsCtrl', [
    '$scope',
    function($scope: any) {
      ModalWizard.markClean('network-settings');

      $scope.command.selectedVnet = {
        name: $scope.command.vnet,
      };

      $scope.command.selectedSubnet = $scope.command.subnet;

      this.networkSettingsChanged = function(item: any) {
        $scope.command.vnet = $scope.command.selectedVnet.name;
        $scope.command.subnet = item;
        ModalWizard.markComplete('network-settings');
      };

      this.getVnetName = function() {
        if ($scope.command.selectedVnet) {
          return $scope.command.selectedVnet.name;
        } else {
          return 'Virtual network was not selected';
        }
      };
    },
  ]);
