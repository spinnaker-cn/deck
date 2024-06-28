'use strict';

const angular = require('angular');

import { AccountService, Registry } from '@spinnaker/core';

module.exports = angular
  .module('spinnaker.ecloud.pipeline.stage.rollbackClusterStage', [])
  .config(function() {
    Registry.pipeline.registerStage({
      provides: 'rollbackCluster',
      cloudProvider: 'ecloud',
      templateUrl: require('./rollbackClusterStage.html'),
      validators: [
        { type: 'requiredField', fieldName: 'cluster' },
        { type: 'requiredField', fieldName: 'regions' },
        { type: 'requiredField', fieldName: 'credentials', fieldLabel: 'account' },
      ],
    });
  })
  .controller('ecloudRollbackClusterStageCtrl', [
    '$scope',
    function($scope) {
      var ctrl = this;

      let stage = $scope.stage;

      $scope.state = {
        accounts: false,
        regionsLoaded: false,
      };

      AccountService.listAccounts('ecloud').then(function(accounts) {
        $scope.accounts = accounts;
        $scope.state.accounts = true;
      });

      ctrl.reset = () => {
        ctrl.accountUpdated();
        ctrl.resetSelectedCluster();
      };

      stage.regions = stage.regions || [];
      stage.cloudProvider = 'ecloud';
      stage.targetHealthyRollbackPercentage = stage.targetHealthyRollbackPercentage || 100;

      if (
        stage.isNew &&
        $scope.application.attributes.platformHealthOnlyShowOverride &&
        $scope.application.attributes.platformHealthOnly
      ) {
        stage.interestingHealthProviderNames = ['Ecloud'];
      }

      if (!stage.credentials && $scope.application.defaultCredentials.ecloud) {
        stage.credentials = $scope.application.defaultCredentials.ecloud;
      }
      if (!stage.regions.length && $scope.application.defaultRegions.ecloud) {
        stage.regions.push($scope.application.defaultRegions.ecloud);
      }
    },
  ]);
