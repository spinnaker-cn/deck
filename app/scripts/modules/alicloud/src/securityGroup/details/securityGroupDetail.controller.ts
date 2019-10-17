'use strict';

const angular = require('angular');
import * as _ from 'lodash';

import { CONFIRMATION_MODAL_SERVICE, SECURITY_GROUP_READER, FirewallLabels } from '@spinnaker/core';
import { ALICLOUD_SECURITY_WRITE_SERVICE } from '../securityGroup.write.service';
import { ALICLOUD_SECURITY_CLONECTRL } from '../clone/cloneSecurityGroup.controller';

export const ALICLOUD_SECURITY_DETAILCTRL = 'spinnaker.alicloud.securityGroup.alicloud.details.controller';
angular
  .module(ALICLOUD_SECURITY_DETAILCTRL, [
    require('@uirouter/angularjs').default,
    SECURITY_GROUP_READER,
    ALICLOUD_SECURITY_WRITE_SERVICE,
    ALICLOUD_SECURITY_CLONECTRL,
    CONFIRMATION_MODAL_SERVICE,
  ])
  .controller('alicloudSecurityGroupDetailsCtrl', [
    '$scope',
    '$state',
    'resolvedSecurityGroup',
    'app',
    'confirmationModalService',
    'alicloudSecurityGroupWriter',
    'securityGroupReader',
    '$uibModal',
    function(
      $scope: any,
      $state: any,
      resolvedSecurityGroup: any,
      app: any,
      confirmationModalService: any,
      alicloudSecurityGroupWriter: any,
      securityGroupReader: any,
      $uibModal: any,
    ) {
      const application = app;
      const securityGroup = resolvedSecurityGroup;

      $scope.state = {
        loading: true,
      };

      $scope.firewallLabel = FirewallLabels.get('Firewall');

      function extractSecurityGroup() {
        return securityGroupReader
          .getSecurityGroupDetails(
            application,
            securityGroup.accountId,
            securityGroup.provider,
            securityGroup.region,
            securityGroup.vpcId,
            securityGroup.name,
          )
          .then(
            function(details: any) {
              $scope.state.loading = false;

              if (!details || _.isEmpty(details)) {
                fourOhFour();
              } else {
                $scope.securityGroup = details;
              }
            },
            function() {
              fourOhFour();
            },
          );
      }

      function fourOhFour() {
        $state.go('^');
      }

      extractSecurityGroup().then(() => {
        // If the user navigates away from the view before the initial extractSecurityGroup call completes,
        // do not bother subscribing to the refresh
        if (!$scope.$$destroyed) {
          app.securityGroups.onRefresh($scope, extractSecurityGroup);
        }
      });

      this.editInboundRules = function editInboundRules() {
        $uibModal.open({
          templateUrl: require('../configure/editSecurityGroup.html'),
          controller: 'alicloudEditSecurityGroupCtrl as ctrl',
          size: 'lg',
          resolve: {
            securityGroup: function() {
              return angular.copy($scope.securityGroup);
            },
            application: function() {
              return application;
            },
          },
        });
      };

      this.cloneSecurityGroup = function cloneSecurityGroup() {
        $uibModal.open({
          templateUrl: require('../clone/cloneSecurityGroup.html'),
          controller: 'alicloudCloneSecurityGroupController as ctrl',
          resolve: {
            securityGroup: function() {
              const securityGroups = angular.copy($scope.securityGroup);
              if (securityGroups.region) {
                securityGroups.regions = [securityGroups.region];
              }
              return securityGroups;
            },
            application: function() {
              return application;
            },
          },
        });
      };

      this.deleteSecurityGroup = function deleteSecurityGroup() {
        const taskMonitor = {
          application: application,
          title: 'Deleting ' + securityGroup.name,
        };

        const submitMethod = function() {
          $scope.securityGroup.type = 'deleteSecurityGroup';
          return alicloudSecurityGroupWriter.deleteSecurityGroup(securityGroup, application, {
            cloudProvider: 'alicloud',
          });
        };

        confirmationModalService.confirm({
          header: 'Really delete ' + securityGroup.name + '?',
          buttonText: 'Delete ' + securityGroup.name,
          provider: 'alicloud',
          account: securityGroup.accountId,
          applicationName: application.name,
          taskMonitorConfig: taskMonitor,
          submitMethod: submitMethod,
        });
      };

      if (app.isStandalone) {
        // we still want the edit to refresh the firewall details when the modal closes
        app.securityGroups = {
          refresh: extractSecurityGroup,
        };
      }
    },
  ]);
