'use strict';

const angular = require('angular');

import { LOAD_BALANCER_READ_SERVICE, ModalWizard } from '@spinnaker/core';

export const ALICLOUD_SERVERGROUP_LOADBALANCER = 'spinnaker.alicloud.serverGroup.configure.loadBalancer.controller';
angular
  .module(ALICLOUD_SERVERGROUP_LOADBALANCER, [LOAD_BALANCER_READ_SERVICE])
  .controller('alicloudServerGroupLoadBalancersCtrl', [
    '$scope',
    'loadBalancerReader',
    function($scope: any, loadBalancerReader: any) {
      ModalWizard.markClean('load-balancers');

      function loadVnetSubnets() {
        loadBalancerReader.getLoadBalancerDetails('alicloud', $scope.command.credentials, $scope.command.region, $scope.command.application)
          .then(function(LBs: any) {
            $scope.command.loadBalancers = LBs.map((item: any) => {
              if ($scope.command.vpcId === item.results.vpcId) {
                return item.results.loadBalancerId
              }
            })
            $scope.command.selectedVnetSubnets = LBs.map((item: any) => {
              return item.results.vpcId
            })
          });
      }

      if ($scope.command.credentials && $scope.command.region ) {
        $scope.command.viewState.networkSettingsConfigured = true;
        $scope.command.selectedVnetSubnets = [];
      }

      $scope.$watch('command.vSwitchId', function (newVal: any) {
        if (newVal) {
          loadVnetSubnets();
        }
      })

      this.loadBalancerChanged = function(item: any) {
        $scope.command.viewState.networkSettingsConfigured = true;
        $scope.command.loadBalancerIds = '[' + "'" + item + "'" + ']';
        $scope.command.newloadBalancerIds = '[' + "'" + item + "'" + ']';
      };
    },
  ]);
