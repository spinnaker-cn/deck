'use strict';

const angular = require('angular');

export const ALICLOUD_SERVERGROUP_ADVANCEDSETTING = 'spinnaker.alicloud.serverGroup.configure.advancedSetting.controller';
angular
  .module(ALICLOUD_SERVERGROUP_ADVANCEDSETTING, [])
  .controller('alicloudServerGroupAdvancedSettingsCtrl', [
    '$scope',
    'modalWizardService',
    function() {
      // modalWizardService.getWizard().markComplete('advanced');
      //
      // $scope.$watch('form.$valid', function(newVal: any) {
      //   if (newVal) {
      //     modalWizardService.getWizard().markClean('advanced');
      //   } else {
      //     modalWizardService.getWizard().markDirty('advanced');
      //   }
      // });
    },
  ]);
