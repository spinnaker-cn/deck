'use strict';

const angular = require('angular');

import { BakeryReader, Registry } from '@spinnaker/core';

module.exports = angular
  .module('spinnaker.ecloud.pipeline.stage.findImageFromNameStage', [])
  .config(function() {
    Registry.pipeline.registerStage({
      provides: 'findImageFromName',
      cloudProvider: 'ecloud',
      templateUrl: require('./findImageFromNameStage.html'),
      executionDetailsUrl: require('./findImageFromNameExecutionDetails.html'),
      executionConfigSections: ['findImageConfig', 'taskStatus'],
      validators: [
        { type: 'requiredField', fieldName: 'packageName' },
        { type: 'requiredField', fieldName: 'regions' },
        { type: 'requiredField', fieldName: 'imageName' },
      ],
    });
  })
  .controller('ecloudFindImageFromNameStageCtrl', [
    '$scope',
    function($scope) {
      $scope.stage.imageName = $scope.stage.imageName || '';
      $scope.stage.regions = $scope.stage.regions || [];
      $scope.stage.cloudProvider = $scope.stage.cloudProvider || 'ecloud';

      BakeryReader.getRegions('ecloud').then(function(regions) {
        $scope.regions = regions;
      });
    },
  ]);

