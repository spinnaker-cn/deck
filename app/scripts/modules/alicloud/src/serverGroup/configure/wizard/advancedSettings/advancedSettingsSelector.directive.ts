'use strict';

const angular = require('angular');

export const ALICLOUD_SERVERGROUP_ADVANCEDSETTING_DIRECTIVE = 'spinnaker.alicloud.serverGroup.configure.wizard.advancedSettings.selector.directive';
angular
  .module(ALICLOUD_SERVERGROUP_ADVANCEDSETTING_DIRECTIVE, [])
  .directive('alicloudServerGroupAdvancedSettingsSelector', function() {
    return {
      restrict: 'E',
      templateUrl: require('./advancedSettingsSelector.directive.html'),
      scope: {},
      bindToController: {
        command: '=',
      },
      controllerAs: 'adv',
      controller: 'alicloudServerGroupAdvancedSettingsSelectorCtrl',
    };
  })
  .controller('alicloudServerGroupAdvancedSettingsSelectorCtrl', function() {});
