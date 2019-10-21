'use strict';

const angular = require('angular');

import { ModalWizard , API } from '@spinnaker/core';

export const ALICLOUD_SERVERGROUP_SECURITY = 'spinnaker.alicloud.serverGroup.configure.securityGroups.controller';
angular
  .module(ALICLOUD_SERVERGROUP_SECURITY, [])
  .directive('focusMe', ['$timeout', function($timeout: any) {
    return {
      scope: { trigger: '@focusMe' },
      link: function(scope: any, element: any) {
        scope.$watch('trigger', function(value: any) {
          if (value === 'true') {
            $timeout(function() {
              element[0].focus();
            });
          }
        });
      }
    };
  }])
  .controller('alicloudServerGroupSecurityGroupsCtrl', [
    '$scope',
    function($scope: any) {
      $scope.serverGroupId = [];
      $scope.instanceType = [];
      $scope.keyPairs = [];
      $scope.ImageId = [];
      $scope.isimage = false;
      $scope.loading = null;

      ModalWizard.markClean('security-groups');
      ModalWizard.markComplete('security-groups');

      $scope.command.selectedSecurityGroup = {
        id: $scope.command.securityGroupName,
      };

      this.securityGroupChanged = function(securityGroup: any) {
        $scope.command.securityGroupName = securityGroup.id;
        $scope.command.scalingConfigurations.securityGroupId = securityGroup.id;
        $scope.command.scalingConfigurations.securityGroupName = securityGroup.name;
        ModalWizard.markComplete('security-groups');
      };

      $scope.$watch('command.vSwitchId', function(newVal: any, oldVal: any ) {
        if (newVal) {
          API.one(`firewalls/${$scope.command.credentials}?provider=alicloud`)
            .get()
            .then(function(firwalls: any) {
              const index = Object.keys(firwalls).indexOf($scope.command.region);
              const val: any[] = [];
              let firevallsValue: any[] = [];
              firevallsValue = firevallsValue.concat(Object.values(firwalls)[index])
              firevallsValue.forEach((item: any) => {
                if ($scope.command.vpcId) {
                  if ($scope.command.vpcId === item.vpcId) {
                    val.push({ 'id': item.id, 'name': item.name })
                  }
                }
              });
              $scope.serverGroupId = val
            })
        }
        if (oldVal !== newVal) {
          $scope.command.scalingConfigurations.securityGroupId = null;
        }
      });

      $scope.$watch('command.masterZoneId', function(newVal: any, oldVal: any ) {
        if (newVal) {
          API.one('instanceTypes')
            .get()
            .then(function(types: any[]) {
              let typeval: any[] = [];
              types.forEach((item: any) => {
                if (item.account === $scope.command.credentials && item.regionId === $scope.command.region && item.zoneId === $scope.command.masterZoneId) {
                  typeval = typeval.concat(item.instanceTypes)
                }
              });
              $scope.instanceType = typeval
            })
          if (oldVal !== newVal) {
            $scope.command.scalingConfigurations.instanceType = null;
            $scope.command.vSwitchId = null;
            $scope.command.scalingConfigurations.securityGroupId = null;
          }
        }
      });

      $scope.$watch('command.region', function(newVal: any, oldVal: any ) {
        if (newVal) {
          API.one('keyPairs')
            .get()
            .then(function(pairs: any) {
              const pairval: any[] = [];
              pairs.forEach((item: any) => {
                if (item.account === $scope.command.credentials) {
                  pairval.push(item.keyName)
                }
              });
              $scope.keyPairs = pairval
            })
          if ( oldVal !== newVal) {
            $scope.command.scalingConfigurations.instanceType = null;
            $scope.command.scalingConfigurations.keyPairName = null;
          }
        }
      })
    },
  ]);

