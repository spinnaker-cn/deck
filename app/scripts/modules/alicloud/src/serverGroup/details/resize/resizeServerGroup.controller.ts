'use strict';

const angular = require('angular');

import { SERVER_GROUP_WRITER , TaskMonitor } from '@spinnaker/core';

export const ALICLOUD_DETAILS_RESIZE = 'spinnaker.alicloud.serverGroup.details.resize.controller';
angular
  .module(ALICLOUD_DETAILS_RESIZE, [
    SERVER_GROUP_WRITER,
    require('../../../common/footer.directive').name,
  ])
  .controller('alicloudResizeServerGroupCtrl', [
    '$scope',
    '$uibModalInstance',
    'serverGroupWriter',
    'application',
    'serverGroup',
    function($scope: any, $uibModalInstance: any, serverGroupWriter: any, application: any, serverGroup: any) {
      $scope.serverGroup = serverGroup;
      $scope.verification = {};

      $scope.command = {
        rollbackType: 'EXPLICIT',
        rollbackContext: {
          rollbackServerGroupName: serverGroup.name,
          enableAndDisableOnly: true,
        },
      };
      $scope.newSize = {
        minSize : null,
        maxSize : null,
        desiredCapacity : null,
      }
      $scope.newSize.minSize = $scope.serverGroup.result.scalingGroup.minSize
      $scope.newSize.maxSize = $scope.serverGroup.result.scalingGroup.maxSize
      $scope.newSize.desiredCapacity = $scope.serverGroup.result.scalingGroup.desiredCapacity

      this.resizedSizePatternChange = function() {
        this.minSizePattern = $scope.newSize.maxSize >= $scope.newSize.minSize
        this.maxSizePattern = $scope.newSize.maxSize >= $scope.newSize.minSize
        this.desiredCapacityPattern = $scope.newSize.desiredCapacity <= $scope.newSize.maxSize && $scope.newSize.desiredCapacity >= $scope.newSize.minSize
      }

      this.minSizePattern = {
        test: function(MinSize: number) {
          if (MinSize > $scope.newSize.maxSize) {
            console.info(MinSize+"---"+$scope.newSize.maxSize)
            return false;
          } else {
            return true;
          }
        },
      };

      this.maxSizePattern = {
        test: function(MaxSize: number) {
          if (MaxSize < $scope.newSize.minSize) {
            return false;
          } else {
            return true;
          }
        },
      };

      this.desiredCapacityPattern = {
        test: function(DesiredCapacity: number) {
          if (DesiredCapacity < $scope.newSize.minSize || DesiredCapacity > $scope.newSize.maxSize) {
            return false;
          } else {
            return true;
          }
        },
      };
      this.isValid = function() {
        if ($scope.newSize.minSize === $scope.serverGroup.result.scalingGroup.minSize
          && $scope.newSize.maxSize === $scope.serverGroup.result.scalingGroup.maxSize
          && $scope.newSize.desiredCapacity === $scope.serverGroup.result.scalingGroup.desiredCapacity) {
          return false
        } else {
          if ($scope.newSize.maxSize == null
            || $scope.newSize.minSize == null
            || $scope.newSize.desiredCapacity == null
            || $scope.newSize.minSize > $scope.newSize.maxSize
            || $scope.newSize.desiredCapacity < $scope.newSize.minSize
            || $scope.newSize.desiredCapacity > $scope.newSize.maxSize) {
            return false;
          } else {
            return true
          }
        }
      };

      $scope.taskMonitor = new TaskMonitor({
        application: application,
        title: 'Resizing ' + serverGroup.name,
        modalInstance: $uibModalInstance,
      });

      this.resize = function() {
        const serverGroups = $scope.serverGroup;
        const capacity = { min: $scope.newSize.minSize, max: $scope.newSize.maxSize, desired: $scope.newSize.desiredCapacity };
        const submitMethod = function() {
          return serverGroupWriter.resizeServerGroup(serverGroups, application, {
            capacity: capacity,
            minSize: $scope.newSize.minSize,
            maxSize: $scope.newSize.maxSize,
            desiredCapacity: $scope.newSize.desiredCapacity,
            reason: $scope.command.reason,
          });
        };
        $scope.taskMonitor.submit(submitMethod);
      };

      this.cancel = function() {
        $uibModalInstance.dismiss();
      };
    },
  ]);

