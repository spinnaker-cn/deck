'use strict';

const angular = require('angular');
import * as _ from 'lodash';

import { AccountService, TaskMonitor, FirewallLabels } from '@spinnaker/core';
import { ALICLOUD_SECURITY_WRITE_SERVICE } from '../securityGroup.write.service';
import { ALICLOUD_SECURITY_CREATECTRL } from '../configure/CreateSecurityGroupCtrl';

export const ALICLOUD_SECURITY_CLONECTRL = 'spinnaker.alicloud.securityGroup.clone.controller';
angular
  .module(ALICLOUD_SECURITY_CLONECTRL, [
    ALICLOUD_SECURITY_WRITE_SERVICE,
    ALICLOUD_SECURITY_CREATECTRL,
  ])
  .controller('alicloudCloneSecurityGroupController', [
    '$scope',
    '$uibModalInstance',
    '$controller',
    '$state',
    'alicloudSecurityGroupWriter',
    'securityGroup',
    'application',
    function($scope: any, $uibModalInstance: any, _$controller: any, $state: any, alicloudSecurityGroupWriter: any, securityGroup: any, application: any) {
      const ctrl: any = this;

      $scope.firewallLabel = FirewallLabels.get('Firewall');

      $scope.pages = {
        location: require('../configure/createSecurityGroupProperties.html'),
        ingress: require('../configure/createSecurityGroupIngress.html'),
      };

      securityGroup.securityRules = _.map(securityGroup.securityRules, function(rule: any) {
        const temp: any[] = rule.destinationPortRange.split('-');
        rule.startPort = Number(temp[0]);
        rule.endPort = Number(temp[1]);
        return rule;
      });

      ctrl.accountUpdated = function() {
        AccountService.getRegionsForAccount($scope.securityGroup.credentials).then(function(regions: any) {
          $scope.regions = regions;
          $scope.securityGroup.regions = regions;
          ctrl.updateName();
        });
      };

      ctrl.cancel = function() {
        $uibModalInstance.dismiss();
      };

      ctrl.updateName = function() {
        const securityGroups: any = $scope.securityGroup;
        let name = application.name;
        if (securityGroups.detail) {
          name += '-' + securityGroups.detail;
        }
        securityGroups.name = name;
        $scope.namePreview = name;
      };

      $scope.securityGroup = securityGroup;

      $scope.state = {
        refreshingSecurityGroups: false,
      };

      $scope.taskMonitor = new TaskMonitor({
        application: application,
        title: `Updating your ${FirewallLabels.get('firewall')}`,
        modalInstance: $uibModalInstance,
        onTaskComplete: onTaskComplete,
      });

      AccountService.listAccounts('alicloud').then(function(accounts: any) {
        $scope.accounts = accounts;
        ctrl.accountUpdated();
      });

      ctrl.addRule = function(ruleset: any) {
        ruleset.push({
          name: $scope.securityGroup.name + '-Rule' + ruleset.length,
          priority: ruleset.length === 0 ? 100 : 100 * (ruleset.length + 1),
          protocol: 'tcp',
          access: 'Allow',
          direction: 'InBound',
          sourceAddressPrefix: '*',
          sourcePortRange: '*',
          destinationAddressPrefix: '*',
          destinationPortRange: '7001-7001',
          startPort: 7001,
          endPort: 7001,
        });
      };

      function onApplicationRefresh() {
        // If the user has already closed the modal, do not navigate to the new details view
        if ($scope.$$destroyed) {
          return;
        }
        $uibModalInstance.close();
        const newStateParams = {
          name: $scope.securityGroup.name,
          accountId: $scope.securityGroup.credentials || $scope.securityGroup.accountName,
          region: $scope.securityGroup.region,
          provider: 'alicloud',
        };
        if (!$state.includes('**.firewallDetails')) {
          $state.go('.firewallDetails', newStateParams);
        } else {
          $state.go('^.firewallDetails', newStateParams);
        }
      }

      function onTaskComplete() {
        application.securityGroups.refresh();
        application.securityGroups.onNextRefresh($scope, onApplicationRefresh);
      }

      ctrl.portUpdated = function(ruleset: any, index: number) {
        ruleset[index].destinationPortRange = ruleset[index].startPort + '-' + ruleset[index].endPort;
      };
      ctrl.removeRule = function(ruleset: any, index: number) {
        ruleset.splice(index, 1);
      };
      ctrl.moveUp = function(ruleset: any, index: number) {
        if (index === 0) {return; }
        swapRules(ruleset, index, index - 1);
      };
      ctrl.moveDown = function(ruleset: any, index: number) {
        if (index === ruleset.length - 1) {return; }
        swapRules(ruleset, index, index + 1);
      };
      function swapRules(ruleset: any, a: any, b: any) {
        let temp, priorityA, priorityB;
        temp = ruleset[b];
        priorityA = ruleset[a].priority;
        priorityB = ruleset[b].priority;
        ruleset[b] = ruleset[a];
        ruleset[a] = temp;
        ruleset[a].priority = priorityA;
        ruleset[b].priority = priorityB;
      }

      ctrl.upsert = function() {
        $scope.taskMonitor.submit(function() {
          const params = {
            cloudProvider: 'alicloud',
            appName: application.name,
            region: $scope.securityGroup.region,
            subnet: 'none',
            vpcId: 'null',
          };
          $scope.securityGroup.type = 'upsertSecurityGroup';

          return alicloudSecurityGroupWriter.upsertSecurityGroup($scope.securityGroup, application, 'Clone', params);
        });
      };
    },
  ]);
