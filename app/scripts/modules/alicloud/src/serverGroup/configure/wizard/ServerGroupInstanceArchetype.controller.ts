'use strict';

const angular = require('angular');

export const ALICLOUD_SERVERGROUP_INSTANCEARCHETYPE = 'spinnaker.alicloud.serverGroup.configure.instanceArchetype.controller';
angular
  .module(ALICLOUD_SERVERGROUP_INSTANCEARCHETYPE, [])
  .controller('alicloudInstanceArchetypeCtrl', [
    '$scope',
    'instanceTypeService',
    'modalWizardService',
    function($scope: any, _instanceTypeService: any, modalWizardService: any) {
      const wizard = modalWizardService.getWizard();

      $scope.$watch('command.viewState.instanceProfile', function() {
        if (!$scope.command.viewState.instanceProfile || $scope.command.viewState.instanceProfile === 'custom') {
          wizard.excludePage('instance-type');
        } else {
          wizard.includePage('instance-type');
          wizard.markClean('instance-profile');
          wizard.markComplete('instance-profile');
        }
      });

      $scope.$watch('command.viewState.instanceType', function(newVal: any) {
        if (newVal) {
          wizard.markClean('instance-profile');
          wizard.markComplete('instance-profile');
        }
      });
    },
  ]);
