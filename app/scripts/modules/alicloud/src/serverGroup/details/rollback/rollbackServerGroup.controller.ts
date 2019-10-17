'use strict';

const angular = require('angular');

import { SERVER_GROUP_WRITER, TaskMonitor } from '@spinnaker/core';

export const ALICLOUD_DETAILS_ROLLBACK = 'spinnaker.alicloud.serverGroup.details.rollback.controller';
angular
  .module(ALICLOUD_DETAILS_ROLLBACK, [
    SERVER_GROUP_WRITER,
    require('../../../common/footer.directive').name,
  ])
  .controller('alicloudRollbackServerGroupCtrl', [
    '$scope',
    '$uibModalInstance',
    'serverGroupWriter',
    'application',
    'serverGroup',
    'disabledServerGroups',
    function($scope: any, $uibModalInstance: any, serverGroupWriter: any, application: any, serverGroup: any, disabledServerGroups: any) {
      $scope.serverGroup = serverGroup;
      $scope.disabledServerGroups = disabledServerGroups
        .sort((a: any, b: any) => b.name.localeCompare(a.name));
      $scope.verification = {};

      let healthyPercent = 100;
      if (serverGroup.capacity.min < 10) {
        healthyPercent = 100;
      } else if (serverGroup.capacity.min  < 20) {
        healthyPercent = 90;
      } else {
        healthyPercent = 95;
      }

      $scope.command = {
        rollbackType: 'EXPLICIT',
        rollbackContext: {
          rollbackServerGroupName: serverGroup.name,
          enableAndDisableOnly: false,
          targetHealthyRollbackPercentage: healthyPercent,
          delayBeforeDisableSeconds: 0,
        },
      };

      this.isValid = function() {
        const command = $scope.command;
        if (!$scope.verification.verified) {
          return false;
        }

        return command.rollbackContext.restoreServerGroupName !== undefined;
      };

      $scope.taskMonitor = new TaskMonitor({
        application: application,
        title: 'Rollback ' + serverGroup.name,
        modalInstance: $uibModalInstance,
      });

      this.rollback = function() {
        this.submitting = true;
        if (!this.isValid()) {
          return;
        }

        const submitMethod = function() {
          $scope.command.interestingHealthProviderNames = [];
          const restoreServerGroup: any = $scope.disabledServerGroups.find(function(disabledServerGroup: any) {
            return disabledServerGroup.name === $scope.command.rollbackContext.restoreServerGroupName;
          });
          $scope.command.targetSize = restoreServerGroup.capacity.max;
          return serverGroupWriter.rollbackServerGroup(serverGroup, application, $scope.command);
        };

        $scope.taskMonitor.submit(submitMethod);
      };

      this.cancel = function() {
        $uibModalInstance.dismiss();
      };
    },
  ]);
