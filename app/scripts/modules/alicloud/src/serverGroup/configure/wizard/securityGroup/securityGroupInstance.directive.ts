'use strict';
const angular = require('angular');
export const ALICLOUD_SERVERGROUP_INSTANCE = 'spinnaker.alicloud.serverGroup.configure.securityGroupSelector.instancedirective';
angular.module(ALICLOUD_SERVERGROUP_INSTANCE, [])
  .directive('alicloudSecurityInstanceDirective', function() {
    return {
      restrict: 'E',
      templateUrl: require('./securityGroupInstance.directive.html'),
      bindToController: {
        command: '=',
        instanceType: '=',
        laybel: '<',
        require: '<',
      },
      controllerAs: 'instanceSelectorCtrl',
      controller: 'InstanceSelectorCtrl',
    };
  })
  .controller('InstanceSelectorCtrl', ['$scope', function($scope: any) {
      $scope.types = [];
      this.getinsatncetype = function(type: any) {
        if ( $scope.types.length > 10 ) {
          return
        } else {
          $scope.types.push(type);
          if (this.laybel === 4) {
            if (this.command.scalingConfiguration.instanceTypes.length < 10) {
              this.command.scalingConfiguration.instanceTypes.push(type);
            }
          } else {
            this.command.scalingConfigurations.instanceTypes = $scope.types;
          }
        }
      };
      this.deleteinstancetype = function(index: any) {
        if ( this.laybel === 4 ) {
          this.command.scalingConfiguration.instanceTypes.splice(index, 1);
        } else {
          this.command.scalingConfigurations.instanceTypes.splice(index, 1);
        }
      };
    }
  ]);
