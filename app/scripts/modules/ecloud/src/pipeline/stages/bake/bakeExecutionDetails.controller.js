'use strict';

const angular = require('angular');
import { get } from 'lodash';

import { SETTINGS } from '@spinnaker/core';

module.exports = angular
  .module('spinnaker.ecloud.pipeline.stage.bake.executionDetails.controller', [require('@uirouter/angularjs').default])
  .controller('ecloudBakeExecutionDetailsCtrl', [
    '$scope',
    '$stateParams',
    'executionDetailsSectionService',
    '$interpolate',
    function($scope, $stateParams, executionDetailsSectionService, $interpolate) {
      $scope.configSections = ['bakeConfig', 'taskStatus'];

      let initialized = () => {
        $scope.detailsSection = $stateParams.details;
        $scope.provider = $scope.stage.context.cloudProviderType || 'ecloud';
        $scope.roscoMode = SETTINGS.feature.roscoMode;
        $scope.bakeryDetailUrl = $interpolate(SETTINGS.bakeryDetailUrl);
        $scope.bakeFailedNoError =
          get($scope.stage, 'context.status.result') === 'FAILURE' && !$scope.stage.failureMessage;
      };

      let initialize = () => executionDetailsSectionService.synchronizeSection($scope.configSections, initialized);

      initialize();

      $scope.$on('$stateChangeSuccess', initialize);
    },
  ]);
