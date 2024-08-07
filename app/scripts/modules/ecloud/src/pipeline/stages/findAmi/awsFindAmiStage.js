'use strict';

const angular = require('angular');

import { AccountService, Registry } from '@spinnaker/core';

module.exports = angular
  .module('spinnaker.ecloud.pipeline.stage.findAmiStage', [])
  .config(function() {
    Registry.pipeline.registerStage({
      provides: 'findImage',
      alias: 'findAmi',
      cloudProvider: 'ecloud',
      templateUrl: require('./findAmiStage.html'),
      validators: [
        { type: 'requiredField', fieldName: 'cluster' },
        { type: 'requiredField', fieldName: 'selectionStrategy', fieldLabel: 'Server Group Selection' },
        { type: 'requiredField', fieldName: 'regions' },
        { type: 'requiredField', fieldName: 'credentials' },
      ],
    });
  })
  .controller('ecloudFindAmiStageCtrl', [
    '$scope',
    function($scope) {
      let stage = $scope.stage;

      $scope.state = {
        accounts: false,
        regionsLoaded: false,
      };

      AccountService.listAccounts('ecloud').then(function(accounts) {
        $scope.accounts = accounts;
        $scope.state.accounts = true;
      });

      $scope.selectionStrategies = [
        {
          label: 'Largest',
          val: 'LARGEST',
          description: 'When multiple server groups exist, prefer the server group with the most instances',
        },
        {
          label: 'Newest',
          val: 'NEWEST',
          description: 'When multiple server groups exist, prefer the newest',
        },
        {
          label: 'Oldest',
          val: 'OLDEST',
          description: 'When multiple server groups exist, prefer the oldest',
        },
        {
          label: 'Fail',
          val: 'FAIL',
          description: 'When multiple server groups exist, fail',
        },
      ];

      stage.regions = stage.regions || [];
      stage.cloudProvider = 'ecloud';
      stage.selectionStrategy = stage.selectionStrategy || $scope.selectionStrategies[0].val;

      if (angular.isUndefined(stage.onlyEnabled)) {
        stage.onlyEnabled = true;
      }
      if (!stage.credentials && $scope.application.defaultCredentials.ecloud) {
        stage.credentials = $scope.application.defaultCredentials.ecloud;
      }
      if (!stage.regions.length && $scope.application.defaultRegions.ecloud) {
        stage.regions.push($scope.application.defaultRegions.ecloud);
      }

      $scope.$watch('stage.credentials', $scope.accountUpdated);
    },
  ]);
