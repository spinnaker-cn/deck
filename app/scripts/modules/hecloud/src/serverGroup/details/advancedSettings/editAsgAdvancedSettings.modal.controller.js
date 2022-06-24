'use strict';

const angular = require('angular');

import { TaskExecutor, TaskMonitor } from '@spinnaker/core';

module.exports = angular
  .module('spinnaker.hecloud.serverGroup.editAsgAdvancedSettings.modal.controller', [
    require('../../configure/serverGroupCommandBuilder.service').name,
  ])
  .controller('hecloudEditAsgAdvancedSettingsCtrl', [
    '$scope',
    '$uibModalInstance',
    'application',
    'serverGroup',
    'hecloudServerGroupCommandBuilder',
    function($scope, $uibModalInstance, application, serverGroup, hecloudServerGroupCommandBuilder) {
      $scope.command = hecloudServerGroupCommandBuilder.buildUpdateServerGroupCommand(serverGroup);

      $scope.serverGroup = serverGroup;

      $scope.taskMonitor = new TaskMonitor({
        application: application,
        title: 'Update Advanced Settings for ' + serverGroup.name,
        modalInstance: $uibModalInstance,
        onTaskComplete: () => application.serverGroups.refresh(),
      });

      this.submit = () => {
        var job = [$scope.command];

        var submitMethod = function() {
          return TaskExecutor.executeTask({
            job: job,
            application: application,
            description: 'Update Advanced Settings for ' + serverGroup.name,
          });
        };

        $scope.taskMonitor.submit(submitMethod);
      };

      this.cancel = $uibModalInstance.dismiss;
    },
  ]);
