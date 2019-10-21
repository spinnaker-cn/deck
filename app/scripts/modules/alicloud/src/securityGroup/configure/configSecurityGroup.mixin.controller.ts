'use strict';

const angular = require('angular');
import * as _ from 'lodash';

import {
  AccountService,
  FirewallLabels,
  SECURITY_GROUP_READER,
  SecurityGroupWriter,
  TaskMonitor,
} from '@spinnaker/core';

export const ALICLOUD_SECURITY_BASECONFIGCTRL = 'spinnaker.alicloud.securityGroup.baseConfig.controller';
angular
  .module(ALICLOUD_SECURITY_BASECONFIGCTRL, [
    require('@uirouter/angularjs').default,
    SECURITY_GROUP_READER,
  ])
  .controller('alicloudConfigSecurityGroupMixin', [
    '$scope',
    '$state',
    '$uibModalInstance',
    'application',
    'securityGroup',
    'securityGroupReader',
    'modalWizardService',
    'cacheInitializer',
    function(
      $scope: any,
      $state: any,
      $uibModalInstance: any,
      application: any,
      securityGroup: any,
      securityGroupReader: any,
      modalWizardService: any,
      cacheInitializer: any,
    ) {
      const ctrl = this;
      $scope.isNew = true;
      $scope.state = {
        submitting: false,
        refreshingSecurityGroups: false,
        removedRules: [],
        infiniteScroll: {
          numToAdd: 20,
          currentItems: 20,
        },
      };

      ctrl.addMoreItems = function() {
        $scope.state.infiniteScroll.currentItems += $scope.state.infiniteScroll.numToAdd;
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
          region: $scope.securityGroup.regions[0],
          vpcId: $scope.securityGroup.vpcId,
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

      $scope.taskMonitor = new TaskMonitor({
        application: application,
        title: `Creating your ${FirewallLabels.get('firewall')}`,
        modalInstance: $uibModalInstance,
        onTaskComplete: onTaskComplete,
      });

      $scope.securityGroup = securityGroup;

      ctrl.upsert = function() {
        $scope.taskMonitor.submit(function() {
          return SecurityGroupWriter.upsertSecurityGroup($scope.securityGroup, application, 'Create');
        });
      };

      function clearSecurityGroups() {
        $scope.availableSecurityGroups = [];
        $scope.existingSecurityGroupNames = [];
      }

      ctrl.accountUpdated = function() {
        const account = $scope.securityGroup.credentials || $scope.securityGroup.accountName;
        AccountService.getRegionsForAccount(account).then(function(regions: any) {
          $scope.regions = _.map(regions, 'name');
          clearSecurityGroups();
          ctrl.regionUpdated();
          ctrl.updateName();
        });
      };

      ctrl.regionUpdated = function() {};

      this.vpcUpdated = function() {
        const account = $scope.securityGroup.credentials || $scope.securityGroup.accountName,
          regions = $scope.securityGroup.regions;
        if (account && regions && regions.length) {
          // configureFilteredSecurityGroups();
        } else {
          clearSecurityGroups();
        }
      };

      // function configureFilteredSecurityGroups() {
      //   const vpcId = $scope.securityGroup.vpcId || null;
      //   const account = $scope.securityGroup.credentials || $scope.securityGroup.accountName;
      //   const regions = $scope.securityGroup.regions || [];
      //   let existingSecurityGroupNames: any[] = [];
      //   let availableSecurityGroups: any[] = [];
      //
      //   regions.forEach(function(region: any) {
      //     let regionalVpcId: any = null;
      //     if (vpcId) {
      //       const baseVpc: any = _.find($scope.allVpcs, { id: vpcId });
      //       regionalVpcId = _.find($scope.allVpcs, { account: account, region: region, name: baseVpc.name }).id;
      //     }
      //
      //     const regionalSecurityGroups: any = _.filter(allSecurityGroups[account].alicloud[region], { vpcId: regionalVpcId }),
      //       regionalGroupNames: any = _.map(regionalSecurityGroups, 'name');
      //
      //     existingSecurityGroupNames = _.uniq(existingSecurityGroupNames.concat(regionalGroupNames));
      //
      //     if (!availableSecurityGroups.length) {
      //       availableSecurityGroups = existingSecurityGroupNames;
      //     } else {
      //       availableSecurityGroups = _.intersection(availableSecurityGroups, regionalGroupNames);
      //     }
      //   });

      //   $scope.availableSecurityGroups = availableSecurityGroups;
      //   $scope.existingSecurityGroupNames = existingSecurityGroupNames;
      //   clearInvalidSecurityGroups();
      // }

      ctrl.mixinUpsert = function(descriptor: any) {
        $scope.taskMonitor.submit(function() {
          return SecurityGroupWriter.upsertSecurityGroup($scope.securityGroup, application, descriptor);
        });
      };

      // function clearInvalidSecurityGroups() {
      //   const removed = $scope.state.removedRules;
      //   $scope.securityGroup.securityGroupIngress = $scope.securityGroup.securityGroupIngress.filter(function(rule: any) {
      //     if (rule.name && !$scope.availableSecurityGroups.includes(rule.name) && !removed.includes(rule.name)) {
      //       removed.push(rule.name);
      //       return false;
      //     }
      //     return true;
      //   });
      //   if (removed.length) {
      //     modalWizardService.getWizard().markDirty('Ingress');
      //   }
      // }

      ctrl.refreshSecurityGroups = function() {
        $scope.state.refreshingSecurityGroups = true;
        return cacheInitializer.refreshCache('securityGroups').then(function() {
          return ctrl.initializeSecurityGroups().then(function() {
            ctrl.vpcUpdated();
            $scope.state.refreshingSecurityGroups = false;
          });
        });
      };

      // let allSecurityGroups: any = {};
      ctrl.initializeSecurityGroups = function() {
        return securityGroupReader.getAllSecurityGroups().then(function(securityGroups: any) {
          // allSecurityGroups = securityGroups;
          const account = $scope.securityGroup.credentials || $scope.securityGroup.accountName;
          const region = $scope.securityGroup.regions[0];
          const vpcId = $scope.securityGroup.vpcId || null;

          let availableGroups;
          if (account && region) {
            availableGroups = _.filter(securityGroups[account].alicloud[region], { vpcId: vpcId });
          } else {
            availableGroups = securityGroups;
          }

          $scope.availableSecurityGroups = _.map(availableGroups, 'name');
        });
      };

      ctrl.cancel = function() {
        $uibModalInstance.dismiss();
      };

      ctrl.getCurrentNamePattern = function() {
        return $scope.securityGroup.vpcId ? vpcPattern : classicPattern;
      };

      ctrl.updateName = function() {
        const securityGroups: any = $scope.securityGroup;
        let name: string = application.name;
        if (securityGroups.detail) {
          name += '-' + securityGroups.detail;
        }
        securityGroups.name = name;
        $scope.namePreview = name;
      };

      ctrl.namePattern = {
        test: function(name: any) {
          return ctrl.getCurrentNamePattern().test(name);
        },
      };

      ctrl.addRule = function(ruleset: any) {
        ruleset.push({
          type: 'tcp',
          startPort: 7001,
          endPort: 7001,
        });
      };

      ctrl.selectedSubnetChanged = function(subnet: any) {
        $scope.command.vSwitchId = subnet.vswitchId;
        $scope.command.vSwitchName = subnet.vswitchName;
        $scope.command.vpcId = subnet.vpcId;
      };

      ctrl.removeRule = function(ruleset: any, index: number) {
        ruleset.splice(index, 1);
      };

      ctrl.dismissRemovedRules = function() {
        $scope.state.removedRules = [];
        modalWizardService.getWizard().markClean('Ingress');
        modalWizardService.getWizard().markComplete('Ingress');
      };

      const classicPattern = /^[\x20-\x7F]+$/;
      const vpcPattern = /^[a-zA-Z0-9\s._\-:/()#,@[\]+=&;{}!$*]+$/;
    },
  ]);
