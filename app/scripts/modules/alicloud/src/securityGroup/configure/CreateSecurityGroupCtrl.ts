'use strict';

const angular = require('angular');
import * as _ from 'lodash';

import { AccountService, FirewallLabels, API, TaskMonitor } from '@spinnaker/core';
import { ALICLOUD_SECURITY_WRITE_SERVICE } from '../securityGroup.write.service';

export const ALICLOUD_SECURITY_CREATECTRL = 'spinnaker.alicloud.securityGroup.create.controller';
angular
  .module(ALICLOUD_SECURITY_CREATECTRL, [
    require('@uirouter/angularjs').default,
    ALICLOUD_SECURITY_WRITE_SERVICE,
  ])

  .controller('alicloudCreateSecurityGroupCtrl', [
    '$scope',
    '$uibModalInstance',
    '$state',
    '$controller',
    'application',
    'securityGroup',
    'alicloudSecurityGroupWriter',
    function($scope: any, $uibModalInstance: any, $state: any, _$controller: any, application: any, securityGroup: any, alicloudSecurityGroupWriter: any) {
      $scope.pages = {
        location: require('./createSecurityGroupProperties.html'),
        ingress: require('./createSecurityGroupIngress.html'),
      };

      $scope.regions = [];

      $scope.firewallLabel = FirewallLabels.get('Firewall');

      const ctrl = this;
      $scope.isNew = true;
      $scope.state = {
        submitting: false,
        infiniteScroll: {
          numToAdd: 20,
          currentItems: 20,
        },
      };

      AccountService.listAccounts('alicloud').then(function(accounts: any) {
        $scope.accounts = accounts;
        ctrl.accountUpdated();
      });

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
          region: $scope.regions[0],
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

      ctrl.accountUpdated = function() {
        AccountService.getRegionsForAccount($scope.securityGroup.credentials).then(function(regions: any) {
          const region: any[] = [];
          regions.forEach((item: any): void => {region.push({ 'name': item })});
          $scope.regions = region;
          ctrl.updateName();
          ctrl.regionUpdated();
        });
      };

      this.regionUpdated = function() {
        ctrl.vnetUpdated();
      };

      this.vnetUpdated = function() {
        const account = $scope.securityGroup.credentials;
        const region = $scope.securityGroup.region;
        $scope.securityGroup.selectedVnet = null;
        $scope.securityGroup.vnet = null;
        $scope.securityGroup.vnetResourceGroup = null;
        ctrl.selectedVnets = [];
        API.one('subnets/alicloud').getList().then((vnets: any) => {
            vnets.forEach((vnet: any) => {
              if (vnet.account === account && vnet.region === region) {
                ctrl.selectedVnets.push(vnet);
              }
            });
        });
        ctrl.subnetUpdated();
      };

      this.subnetUpdated = function() {
        $scope.securityGroup.selectedSubnet = null;
        $scope.securityGroup.subnet = null;
        ctrl.selectedSubnets = [];
      };

      this.selectedVnetChanged = function(item: any) {
        $scope.securityGroup.vnet = item.name;
        $scope.securityGroup.vnetResourceGroup = item.resourceGroup;
        $scope.securityGroup.selectedSubnet = null;
        $scope.securityGroup.subnet = null;
        ctrl.selectedSubnets = [];
        if (item.subnets) {
          item.subnets.map(function(subnet: any) {
            ctrl.selectedSubnets.push(subnet);
          });
        }
      };

      ctrl.selectedSubnetChanged = function(subnet: any) {
        $scope.securityGroup.vpcName = subnet.vpcName;
        $scope.securityGroup.vpcId = subnet.vpcId;
      };

      ctrl.cancel = function() {
        $uibModalInstance.dismiss();
      };

      ctrl.updateName = function() {
        const securityGroups: any = $scope.securityGroup;
        let name: string = application.name;
        if (securityGroups.detail) {
          name += '-' + securityGroups.stack + '-' + securityGroups.detail;
        }
        securityGroups.name = name;
        $scope.namePreview = name;
      };

      ctrl.upsert = function() {
        if ($scope.securityGroup.region) {
          $scope.securityGroup.regions = $scope.securityGroup.region.split(' ');
          delete $scope.securityGroup.region;
        }
        $scope.securityGroup.securityGroupIngress.forEach((item: any) => {
          item.portRange = item.startPortRange + '/' + item.endPortRange
        });
        $scope.taskMonitor.submit(function() {
          const params = {
            cloudProvider: 'alicloud',
            appName: application.name,
            vpcId: $scope.securityGroup.vpcId.vpcId || null,
            subnet: $scope.securityGroup.vpcId.vswitchId || null
          };

          if ($scope.securityGroup.selectedVnet) {
            $scope.securityGroup.vnet = $scope.securityGroup.selectedVnet.name;
            $scope.securityGroup.vnetResourceGroup = $scope.securityGroup.selectedVnet.resourceGroup;
          }

          $scope.securityGroup.type = 'upsertSecurityGroup';

          return alicloudSecurityGroupWriter.upsertSecurityGroup($scope.securityGroup, application, 'Create', params);
        });
      };

      ctrl.addRule = function(ruleset: any) {
        ruleset.push({
          name: $scope.securityGroup.name + '-Rule' + ruleset.length,
          priority: ruleset.length === 0 ? 100 : 100 * (ruleset.length + 1),
          ipProtocol: 'tcp',
          portRange: '',
          sourceCidrIp: '',
        });
      };

      ctrl.portUpdated = function(ruleset: any, index: number) {
        if (!_.isEmpty(ruleset[index].destPortRanges)) {
          const ruleRanges: any[] = ruleset[index].destPortRanges.split(',');

          if (ruleRanges.length > 1) {
            ruleset[index].destinationPortRanges = [];
            ruleRanges.forEach(v => ruleset[index].destinationPortRanges.push(v));

            // If there are multiple port ranges then set null to the single port parameter otherwise ARM template will fail in validation.
            ruleset[index].destinationPortRange = null;
          } else {
            ruleset[index].destinationPortRange = ruleset[index].destPortRanges;

            // If there is a single port range then set null to the port array otherwise ARM template will fail in validation.
            ruleset[index].destinationPortRanges = [];
          }
        }
      };

      ctrl.sourceIPCIDRUpdated = function(ruleset: any, index: number) {
        if (!_.isEmpty(ruleset[index].destPortRanges)) {
          const ruleRanges = ruleset[index].sourceIPCIDRRanges.split(',');
          if (ruleRanges.length > 1) {
            ruleset[index].sourceAddressPrefixes = [];
            ruleRanges.forEach((v: any) => ruleset[index].sourceAddressPrefixes.push(v));

            // If there are multiple IP/CIDR ranges then set null to the single sourceAddressPrefix parameter otherwise ARM template will fail in validation
            ruleset[index].sourceAddressPrefix = null;
          } else {
            ruleset[index].sourceAddressPrefix = ruleset[index].sourceIPCIDRRanges;

            // If there is a single IP/CIDR then set null to the IP/CIDR array otherwise ARM template will fail in validation.
            ruleset[index].sourceAddressPrefixes = [];
          }
        }
      };

      ctrl.maxSizePattern = function(rule: any) {
        if (rule.endPortRange) {
          if (rule.startPortRange >= rule.endPortRange) {
            rule.startPortRange = null
          }
        }
      };
      ctrl.minSizePattern = function(rule: any) {
        if (rule.startPortRange) {
          if (rule.startPortRange >= rule.endPortRange) {
            rule.endPortRange = null
          }
        }
      };

      ctrl.protocolUpdated = function(ruleset: any, index: number) {
        ruleset[index].ipProtocol = ruleset[index].ipProtocol;
      };

      ctrl.removeRule = function(ruleset: any, index: number) {
        ruleset.splice(index, 1);
      };

      ctrl.moveUp = function(ruleset: any, index: number) {
        if (index === 0) {
          return;
        } else {
          swapRules(ruleset, index, index - 1);
        }
      };

      ctrl.moveDown = function(ruleset: any, index: number) {
        if (index === ruleset.length - 1) {
          return;
        } else {
          swapRules(ruleset, index, index + 1)
        }
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

      $scope.securityGroup.securityGroupIngress = [];
    },
  ]);
