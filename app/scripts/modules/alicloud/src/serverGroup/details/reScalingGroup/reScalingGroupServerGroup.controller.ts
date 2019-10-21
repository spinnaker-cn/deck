'use strict';

const angular = require('angular');

import { TaskMonitor } from '@spinnaker/core';
import { SERVER_GROUP_WRITER_ALI } from '../serverGroupWirter';

export const ALICLOUD_SERVERGROUP_DETAIL_SCLAINGGROUP = 'spinnaker.alicloud.serverGroup.details.rescalinggroup.controller';
angular
  .module(ALICLOUD_SERVERGROUP_DETAIL_SCLAINGGROUP , [
    SERVER_GROUP_WRITER_ALI,
    require('../../../common/footer.directive').name,
  ])
  .controller('alicloudReScalingGroupServerGroupCtrl', [
    '$scope',
    '$uibModalInstance',
    'serverGroupWriters',
    'application',
    'serverGroup',
    function($scope: any, $uibModalInstance: any, serverGroupWriters: any, application: any, serverGroup: any) {
      $scope.serverGroup = serverGroup;
      $scope.verification = {};

      $scope.command = $scope.serverGroup.moniker;
      $scope.command.defaultCooldown = serverGroup.result.scalingGroup.defaultCooldown;

      this.isValid = function() {
        if ($scope.command.stack !== $scope.serverGroup.moniker.stack || $scope.serverGroup.moniker.detail !== $scope.command.detail || serverGroup.result.scalingGroup.defaultCooldown !== $scope.command.defaultCooldown) {
          return true
        } else {
          return false
        }
      };

      $scope.taskMonitor = new TaskMonitor({
        application: application,
        title: 'edit ' + serverGroup.name,
        modalInstance: $uibModalInstance,
      });

      this.submit = function() {
        const serverGroups: any = $scope.serverGroup;
        const submitMethod = function() {
          return serverGroupWriters.editServerGroups(serverGroups, application);
        };
        $scope.taskMonitor.submit(submitMethod);
      };

      this.cancel = function() {
        $uibModalInstance.dismiss();
      };
    },
  ]);
