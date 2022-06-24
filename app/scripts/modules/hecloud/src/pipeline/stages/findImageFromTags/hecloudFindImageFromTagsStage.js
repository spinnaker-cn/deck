'use strict';

const angular = require('angular');

import { BakeryReader, Registry } from '@spinnaker/core';

module.exports = angular
  .module('spinnaker.hecloud.pipeline.stage.findImageFromTagsStage', [])
  .config(function() {
    Registry.pipeline.registerStage({
      provides: 'findImageFromTags',
      cloudProvider: 'hecloud',
      templateUrl: require('./findImageFromTagsStage.html'),
      executionDetailsUrl: require('./findImageFromTagsExecutionDetails.html'),
      executionConfigSections: ['findImageConfig', 'taskStatus'],
      validators: [
        { type: 'requiredField', fieldName: 'packageName' },
        { type: 'requiredField', fieldName: 'regions' },
        { type: 'requiredField', fieldName: 'tags' },
      ],
    });
  })
  .controller('hecloudFindImageFromTagsStageCtrl', [
    '$scope',
    function($scope) {
      $scope.stage.tags = $scope.stage.tags || {};
      $scope.stage.regions = $scope.stage.regions || [];
      $scope.stage.cloudProvider = $scope.stage.cloudProvider || 'hecloud';

      BakeryReader.getRegions('hecloud').then(function(regions) {
        $scope.regions = regions;
      });
    },
  ]);
