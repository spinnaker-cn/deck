'use strict';

const angular = require('angular');

import { CACHE_INITIALIZER_SERVICE, FirewallLabels } from '@spinnaker/core';

module.exports = angular
  .module('spinnaker.ecloud.securityGroup.create.controller', [
    require('@uirouter/angularjs').default,
    CACHE_INITIALIZER_SERVICE,
  ])
  .controller('ecloudCreateSecurityGroupCtrl', [
    '$scope',
    '$uibModalInstance',
    '$state',
    '$controller',
    'cacheInitializer',
    'application',
    'securityGroup',
    function($scope, $uibModalInstance, $state, $controller, cacheInitializer, application, securityGroup) {
      $scope.pages = {
        location: require('./createSecurityGroupProperties.html'),
        ingress: require('./createSecurityGroupIngress.html'),
      };
      $scope.regionFilters = [];
      var ctrl = this;

      ctrl.translate = label => FirewallLabels.get(label);
      ctrl.protocolChange = rule => {
        if (rule.protocol == 'ICMP') {
          rule.port = '';
        }
      };
      angular.extend(
        this,
        $controller('ecloudConfigSecurityGroupMixin', {
          $scope: $scope,
          $uibModalInstance: $uibModalInstance,
          application: application,
          securityGroup: securityGroup,
        }),
      );

      $scope.state.isNew = true;

      ctrl.upsert = () => ctrl.mixinUpsert('Create');

      ctrl.initializeSecurityGroups().then(ctrl.initializeAccounts);
    },
  ]);
