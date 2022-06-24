'use strict';

const angular = require('angular');

import { Registry, PipelineConfigService, StageConstants } from '@spinnaker/core';

module.exports = angular
  .module('spinnaker.hecloud.pipeline.stage.tagImageStage', [])
  .config(function() {
    Registry.pipeline.registerStage({
      provides: 'upsertImageTags',
      cloudProvider: 'hecloud',
      templateUrl: require('./tagImageStage.html'),
      executionDetailsUrl: require('./tagImageExecutionDetails.html'),
      executionConfigSections: ['tagImageConfig', 'taskStatus'],
    });
  })
  .controller('hecloudTagImageStageCtrl', [
    '$scope',
    $scope => {
      $scope.stage.tags = $scope.stage.tags || {};
      $scope.stage.cloudProvider = $scope.stage.cloudProvider || 'hecloud';

      const initUpstreamStages = () => {
        const upstreamDependencies = PipelineConfigService.getAllUpstreamDependencies(
          $scope.pipeline,
          $scope.stage,
        ).filter(stage => StageConstants.IMAGE_PRODUCING_STAGES.includes(stage.type));
        $scope.consideredStages = new Map(upstreamDependencies.map(stage => [stage.refId, stage.name]));
      };
      $scope.$watch('stage.requisiteStageRefIds', initUpstreamStages);
    },
  ]);
