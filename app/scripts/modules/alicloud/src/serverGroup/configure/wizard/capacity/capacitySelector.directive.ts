'use strict';
const angular = require('angular');

export const ALICLOUD_SERVERGROUP_CAPACITY_DIRECTIVE = 'spinnaker.alicloud.serverGroup.configure.wizard.capacity.selector.directive';
angular
  .module(ALICLOUD_SERVERGROUP_CAPACITY_DIRECTIVE, [])
  .directive('alicloudServerGroupCapacitySelector', function() {
    return {
      restrict: 'E',
      templateUrl: require('./capacitySelector.directive.html'),
      scope: {},
      bindToController: {
        command: '=',
      },
      controllerAs: 'cap',
      controller: 'alicloudServerGroupCapacitySelectorCtrl',
    };
  })
  .controller('alicloudServerGroupCapacitySelectorCtrl', [ '$scope' , function($scope: any) {
    // $scope.command.useSourceCapacity = true;
    this.useSourceCapacityUpdated = function() {
      const a = $scope.command.useSourceCapacity;
      $scope.command.useSourceCapacity = !a;
    };
    const myDiv = document.getElementById('capacity' );
    myDiv.addEventListener('click', function () {
      let a = false;
      if ($scope.command.useSourceCapacity) {
        a = $scope.command.useSourceCapacity
      }
      $scope.command.useSourceCapacity = !a;
    });
  }]);






