'use strict';

const angular = require('angular');

import { AccountService, BakeryReader, Registry } from '@spinnaker/core';

module.exports = angular
  .module('spinnaker.alicloud.pipeline.stage.alicloud.tagImageStage', [])
  .config(function() {
    Registry.pipeline.registerStage({
      provides: 'upsertImageTags',
      cloudProvider: 'alicloud',
      templateUrl: require('./tagImageStage.html'),
      executionDetailsUrl: require('./tagImageExecutionDetails.html'),
      executionConfigSections: ['tagImageConfig', 'taskStatus'],
      validators: [
        { type: 'requiredField', fieldName: 'region' },
        { type: 'requiredField', fieldName: 'tags' },
      ],
    });
  })
  .controller('alicloudTagImageStageCtrl', [
    '$scope',
    function($scope) {
      $scope.stage.tags = $scope.stage.tags || {};
      $scope.stage.region = $scope.stage.region || "";
      $scope.stage.cloudProvider = $scope.stage.cloudProvider || 'alicloud';

      BakeryReader.getRegions('alicloud').then(function(regions) {
        $scope.regions = regions;
      });
      AccountService.listAccounts('alicloud').then(function(accounts) {
        $scope.accounts = []
        for (var i = 0; i < accounts.length; i++) {
          $scope.accounts.push(accounts[i].name);
        }
      });
    },
  ]);
