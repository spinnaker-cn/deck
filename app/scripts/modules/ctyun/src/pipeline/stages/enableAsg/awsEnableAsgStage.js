'use strict';

const angular = require('angular');

import { AccountService, Registry, StageConstants } from '@spinnaker/core';

module.exports = angular
  .module('spinnaker.ctyun.pipeline.stage.enableAsgStage', [])
  .config(function() {
    Registry.pipeline.registerStage({
      provides: 'enableServerGroup',
      alias: 'enableAsg',
      cloudProvider: 'ctyun',
      templateUrl: require('./enableAsgStage.html'),
      executionStepLabelUrl: require('./enableAsgStepLabel.html'),
      validators: [
        { type: 'requiredField', fieldName: 'cluster' },
        { type: 'requiredField', fieldName: 'target' },
        { type: 'requiredField', fieldName: 'regions' },
        { type: 'requiredField', fieldName: 'credentials', fieldLabel: 'account' },
      ],
    });
  })
  .controller('ctyunEnableAsgStageCtrl', [
    '$scope',
    function($scope) {
      var ctrl = this;

      let stage = $scope.stage;

      $scope.state = {
        accounts: false,
        regionsLoaded: false,
      };

      AccountService.listAccounts('ctyun').then(function(accounts) {
        $scope.accounts = accounts;
        $scope.state.accounts = true;
      });

      ctrl.reset = () => {
        ctrl.accountUpdated();
        ctrl.resetSelectedCluster();
      };

      $scope.targets = StageConstants.TARGET_LIST;

      stage.regions = stage.regions || [];
      stage.cloudProvider = 'ctyun';

      if (
        stage.isNew &&
        $scope.application.attributes.platformHealthOnlyShowOverride &&
        $scope.application.attributes.platformHealthOnly
      ) {
        stage.interestingHealthProviderNames = ['ctyun'];
      }

      if (!stage.credentials && $scope.application.defaultCredentials.ctyun) {
        stage.credentials = $scope.application.defaultCredentials.ctyun;
      }
      if (!stage.regions.length && $scope.application.defaultRegions.ctyun) {
        stage.regions.push($scope.application.defaultRegions.ctyun);
      }

      if (!stage.target) {
        stage.target = $scope.targets[0].val;
      }

      $scope.$watch('stage.credentials', $scope.accountUpdated);
    },
  ]);
