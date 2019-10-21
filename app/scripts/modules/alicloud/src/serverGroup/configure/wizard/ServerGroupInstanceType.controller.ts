'use strict';

const angular = require('angular');

export const ALICLOUD_SERVERGROUP_INSTANCETYPE = 'spinnaker.alicloud.serverGroup.configure.instanceType.controller';
angular
  .module(ALICLOUD_SERVERGROUP_INSTANCETYPE, [])
  .controller('alicloudInstanceTypeCtrl', [
    '$scope',
    'modalWizardService',
    function(_$scope: any, modalWizardService: any) {
      modalWizardService.getWizard().markComplete('instance-type');
      modalWizardService.getWizard().markClean('instance-type');
    },
  ]);


