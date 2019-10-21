'use strict';

const angular = require('angular');

import { API, TaskMonitor } from '@spinnaker/core';
import { SERVER_GROUP_WRITER_ALI } from '../serverGroupWirter'
export const ALICLOUD_SERVERGROUP_DETAIL_UPDATESECURITY = 'spinnaker.alicloud.serverGroup.details.updateSecurityGroup.controller';
angular
  .module(ALICLOUD_SERVERGROUP_DETAIL_UPDATESECURITY, [
    SERVER_GROUP_WRITER_ALI,
    require('../../../common/footer.directive').name,
  ])
  .controller('alicloudUpdateSecurityGroupServerGroupCtrl', [
    '$scope',
    '$uibModalInstance',
    'serverGroupWriters',
    'application',
    'serverGroup',
    function($scope: any, $uibModalInstance: any, serverGroupWriters: any, application: any, serverGroup: any) {
      $scope.serverGroup = serverGroup;
      $scope.serverGroupId = [];
      $scope.verification = {};
      API.one(`firewalls/${$scope.serverGroup.account}?provider=alicloud`)
        .get()
        .then(function(firwalls: any) {
          const val: any[] = [];
          if (Array.isArray(firwalls)) {
            const index: number = Object.keys(firwalls).indexOf($scope.serverGroup.region)
            Object.values(firwalls)[index].forEach((item: any) => {
              if ($scope.serverGroup.result.scalingGroup.vpcId) {
                if ($scope.serverGroup.result.scalingGroup.vpcId === item.vpcId) {
                  val.push({ id: item.id, name: item.name })
                }
              }
            })
          } else {
            const fvalue: any = $scope.serverGroup.result.scalingGroup.regionId
            firwalls[fvalue].forEach((item: any) => {
              if ($scope.serverGroup.result.scalingGroup.vpcId) {
                if ($scope.serverGroup.result.scalingGroup.vpcId === item.vpcId) {
                  val.push({ id: item.id, name: item.name })
                }
              }
            })
          }
          $scope.serverGroupId = val
        })

      $scope.command = { 'securityGroupId' : $scope.serverGroup.result.scalingConfiguration.securityGroupId };

      this.securityGroupChanged = function(securityGroup: any) {
        $scope.serverGroup.securityGroupName = securityGroup.id;
        $scope.serverGroup.result.scalingConfiguration.securityGroupId = securityGroup.id;
        $scope.serverGroup.result.scalingConfiguration.securityGroupName = securityGroup.name;
      };

      this.isValid = function() {
        if ($scope.command.securityGroupId !== $scope.serverGroup.result.scalingConfiguration.securityGroupId ) {
          return true
        } else {
          return false
        }
      };

      $scope.taskMonitor = new TaskMonitor({
        application: application,
        title: 'UpdateSecurityGroupsFor' + serverGroup.name,
        modalInstance: $uibModalInstance,
      });

      this.submit = function() {
        const serverGroups = $scope.serverGroup;
        const securityGroups = [{
          'id': serverGroup.result.scalingConfiguration.securityGroupId
        }]
        const submitMethod = function() {
          return serverGroupWriters.updateSecurityGroupss(serverGroups, securityGroups, application);
        }
        $scope.taskMonitor.submit(submitMethod);
      };

      this.cancel = function() {
        $uibModalInstance.dismiss();
      };
    },
  ]);
