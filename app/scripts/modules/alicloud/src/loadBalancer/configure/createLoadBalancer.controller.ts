'use strict';
const angular = require('angular');
import * as _ from 'lodash';
import { AccountService, LoadBalancerWriter, NameUtils, TaskMonitor, API } from '@spinnaker/core';
import { ALICLOUD_LOADBALANCER_BALANCER } from '../loadBalancer.transformer';
export const ALICLOUD_LOADBALANCER_CREATE = 'spinnaker.alicloud.loadBalancer.create.controller';

angular
  .module(ALICLOUD_LOADBALANCER_CREATE, [require('@uirouter/angularjs').default, ALICLOUD_LOADBALANCER_BALANCER])
  .controller('alicloudCreateLoadBalancerCtrl', [
    '$scope',
    '$uibModalInstance',
    '$state',
    'alicloudLoadBalancerTransformer',
    'application',
    'loadBalancer',
    '$compile',
    'isNew',
    function(
      $scope: any,
      $uibModalInstance: any,
      $state: any,
      alicloudLoadBalancerTransformer: any,
      application: any,
      loadBalancer: any,
      _$compile: any,
      isNew: any,
    ) {
      const ctrl = this;
      $scope.regions = [];
      $scope.zoneIds = [];
      $scope.subnets = [];
      ctrl.regions = [];
      ctrl.selectedSubnets = [];
      $scope.pages = {
        location: require('./createLoadBalancerProperties.html'),
        listeners: require('./listeners.html'),
        healthCheck: require('./healthCheck.html'),
      };
      $scope.isEdit = true;

      $scope.isNew = isNew;
      $scope.typeChange = function(index: number, type: string, rule: any) {
        if (type === 'TCP') {
          $scope.loadBalancer.listeners[index].healthCheck = 'on';
          rule.healthCheckURI = null;
          rule.stickySession = null;
          rule.cookie = null;
          rule.cookieTimeout = null;
          rule.gzip = null;
          rule.stickySessionType = null;
          rule.requestTimeout = null;
          rule.idleTimeout = null;
          rule.ServerCertificateId = null;
        } else {
          if (type === 'HTTPS') {
          } else {
            rule.ServerCertificateId = null;
          }
        }
      };
      $scope.healthChange = function(status: string, _index: number, rule: any) {
        if (status !== 'on') {
          rule.healthCheckURI = null;
          rule.healthCheckInterval = null;
          rule.unhealthyThreshold = null;
          rule.healthyThreshold = null;
          rule.healthCheckTimeout = null;
          rule.stickySession = null;
          rule.cookie = null;
          rule.cookieTimeout = null;
          rule.gzip = null;
          rule.stickySessionType = null;
          rule.scheduler = null;
          rule.requestTimeout = null;
          rule.idleTimeout = null;
          rule.healthCheckHttpCode = null;
        }
      };
      $scope.state = {
        accountsLoaded: false,
        submitting: false,
      };

      initializeController();

      $scope.selectedHealthCheckHttpCode = '';
      $scope.HealthCheckHttpCodechange = function(name: any) {
        if (name.rule.healthCheckHttpCode !== '') {
          const hlthcode = name.$$watchers[10].last.split(',');
          if (hlthcode.length > 1) {
            const prevcode = name.rule.healthCheckHttpCode;
            name.rule.healthCheckHttpCode = name.$$watchers[10].last + ',' + name.rule.healthCheckHttpCode;
            for (const row of hlthcode) {
              if (prevcode === row) {
                name.rule.healthCheckHttpCode = name.$$watchers[10].last;
                break;
              }
            }
          } else {
            if (name.$$watchers[10].last !== '' && name.$$watchers[10].last !== name.rule.healthCheckHttpCode) {
              name.rule.healthCheckHttpCode = name.$$watchers[10].last + ',' + name.rule.healthCheckHttpCode;
            }
          }
        }
      };

      $scope.$watch('loadBalancer.masterZoneId', function(newVal: any) {
        if (newVal) {
          $scope.loadBalancer.vSwitchId = null;
          $scope.subnets = ctrl.selectedSubnets.filter((item: any) => {
            return $scope.loadBalancer.masterZoneId === item.zoneId;
          });
        }
      });

      function onApplicationRefresh() {
        // If the user has already closed the modal, do not navigate to the new details view
        if ($scope.$$destroyed) {
          return;
        }
        $uibModalInstance.close();
        const newStateParams = {
          name: $scope.loadBalancer.name,
          accountId: $scope.loadBalancer.credentials,
          region: $scope.loadBalancer.region,
          provider: 'alicloud',
        };

        if (!$state.includes('**.loadBalancerDetails')) {
          $state.go('.loadBalancerDetails', newStateParams);
        } else {
          $state.go('^.loadBalancerDetails', newStateParams);
        }
      }

      function onTaskComplete() {
        application.loadBalancers.refresh();
        application.loadBalancers.onNextRefresh($scope, onApplicationRefresh);
      }

      $scope.taskMonitor = new TaskMonitor({
        application: application,
        title: (isNew ? 'Creating ' : 'Updating ') + 'your load balancer',
        modalInstance: $uibModalInstance,
        onTaskComplete: onTaskComplete,
      });

      function initializeCreateMode() {
        AccountService.listAccounts('alicloud').then(function(accounts: any) {
          $scope.accounts = accounts;
          const nregion: any[] = [];
          accounts[0].regions.forEach((item: any) => {
            nregion.push({ name: item });
          });
          $scope.regions = nregion;
          $scope.state.accountsLoaded = true;
          ctrl.accountUpdated();
        });
      }

      function initializeController() {
        if (loadBalancer) {
          $scope.loadBalancer = alicloudLoadBalancerTransformer.convertLoadBalancerForEditing(loadBalancer);
          AccountService.listAccounts('alicloud').then(function(accounts: any) {
            $scope.accounts = accounts;
          });
          $scope.loadBalancer.listeners.forEach((item: any) => {
            item.listenerProtocal = _.toUpper(item.listenerProtocal);
          });

          const account = $scope.loadBalancer.credentials,
            region = $scope.loadBalancer.region;
          $scope.loadBalancer.selectedVnet = null;
          $scope.loadBalancer.vnet = null;
          $scope.loadBalancer.vnetResourceGroup = null;
          ctrl.selectedVnets = [];

          API.one('subnets/alicloud')
            .getList()
            .then((vnets: any) => {
              const subnets: any[] = [];
              vnets.forEach((vnet: any) => {
                if (vnet.account === account && vnet.region === region) {
                  subnets.push(vnet);
                }
              });
              ctrl.selectedSubnets = subnets;
              $scope.zoneIds = Array.from(
                new Set(
                  subnets.map(item => {
                    return item.zoneId;
                  }),
                ),
              );
              subnets.forEach(item => {
                if ($scope.loadBalancer.vSwitchId === item.vswitchId) {
                  $scope.loadBalancer.vSwitchName = item.vswitchName;
                }
              });
            });
          if (isNew) {
            const nameParts = NameUtils.parseLoadBalancerName($scope.loadBalancer.name);
            $scope.loadBalancer.stack = nameParts.stack;
            $scope.loadBalancer.detail = nameParts.freeFormDetails;
            delete $scope.loadBalancer.name;
          }
          $scope.state.accountsLoaded = true;
        } else {
          $scope.loadBalancer = alicloudLoadBalancerTransformer.constructNewLoadBalancerTemplate(application);
        }
        initializeCreateMode();
        if (isNew) {
          updateLoadBalancerNames();
        }
      }

      function updateLoadBalancerNames() {
        const account = $scope.loadBalancer.credentials,
          region = $scope.loadBalancer.region;

        const accountLoadBalancersByRegion: any = {};
        application
          .getDataSource('loadBalancers')
          .refresh(true)
          .then(() => {
            application.getDataSource('loadBalancers').data.forEach((item: any) => {
              if (item.account === account) {
                accountLoadBalancersByRegion[item.region] = accountLoadBalancersByRegion[item.region] || [];
                accountLoadBalancersByRegion[item.region].push(item.name);
              }
            });

            $scope.existingLoadBalancerNames = accountLoadBalancersByRegion[region] || [];
          });
      }

      this.updateName = function() {
        $scope.loadBalancer.name = this.getName();
      };

      this.getName = function() {
        const elb = $scope.loadBalancer;
        const elbName = [application.name, elb.stack || '', elb.detail || ''].join('-');
        return _.trimEnd(elbName, '-');
      };

      this.accountUpdated = function() {
        AccountService.getRegionsForAccount($scope.loadBalancer.credentials).then(function(regions: any) {
          const Region: any = [];
          regions.forEach((item: any) => {
            Region.push({ name: item });
          });
          if (Region[0]) {
            $scope.loadBalancer.region = Region[0].name;
          }
          $scope.regions = Region;
          ctrl.regions = $scope.regions;
          ctrl.regionUpdated();
        });
      };

      this.regionUpdated = function() {
        updateLoadBalancerNames();
        ctrl.updateName();
        ctrl.vnetUpdated();
      };

      this.vnetUpdated = function() {
        const account = $scope.loadBalancer.credentials,
          region = $scope.loadBalancer.region;
        $scope.loadBalancer.selectedVnet = null;
        $scope.loadBalancer.vnet = null;
        $scope.loadBalancer.vnetResourceGroup = null;
        ctrl.selectedVnets = [];

        API.one('subnets/alicloud')
          .getList()
          .then((vnets: any) => {
            const subnets: any[] = [];
            vnets.forEach((vnet: any) => {
              if (vnet.account === account && vnet.region === region) {
                subnets.push(vnet);
              }
            });
            ctrl.selectedSubnets = subnets;
            $scope.zoneIds = Array.from(
              new Set(
                subnets.map(item => {
                  return item.zoneId;
                }),
              ),
            );
          });

        ctrl.subnetUpdated();
      };

      this.subnetUpdated = function() {
        $scope.loadBalancer.selectedSubnet = null;
        $scope.loadBalancer.subnet = null;
        ctrl.selectedSubnets = [];
      };

      this.addresstypechange = function(type: string) {
        if (type === 'internet') {
          $scope.loadBalancer.VSwitchId = null;
        }
      };

      $scope.stickySessionchange = function(type: string, rule: any) {
        if (type === 'off') {
          rule.stickySessionType = '';
          rule.cookie = '';
          rule.cookieTimeout = '';
        }
      };

      this.selectedSubnetChanged = function(subnet: any) {
        $scope.loadBalancer.vSwitchId = subnet.vswitchId;
        $scope.loadBalancer.subnetId = subnet.vswitchId;
        $scope.loadBalancer.vSwitchName = subnet.vswitchName;
        if (subnet != null) {
          $scope.loadBalancer.AddressType = 'intranet';
        }
      };

      this.selectedVnetChanged = function(item: any) {
        $scope.loadBalancer.vnet = item.name;
        $scope.loadBalancer.vnetResourceGroup = item.resourceGroup;
        $scope.loadBalancer.selectedSubnet = null;
        $scope.loadBalancer.subnet = null;
        ctrl.selectedSubnets = [];
        if (item.subnets) {
          item.subnets.map(function(subnet: any) {
            let addSubnet = true;
            if (subnet.devices) {
              subnet.devices.map(function(device: any) {
                if (device && device.type !== 'applicationGateways') {
                  addSubnet = false;
                }
              });
            }
            if (addSubnet) {
              if (subnet.region === $scope.loadBalancer.region) {
                ctrl.selectedSubnets.push(subnet);
              }
            }
          });
        }
      };

      this.removeListener = function(index: number) {
        $scope.loadBalancer.listeners.splice(index, 1);
      };

      this.addListener = function() {
        const un = { listenerProtocal: 'HTTP', healthCheck: 'on', bandwidth: -1 };
        $scope.loadBalancer.listeners.push(un);
      };
      $scope.$watch(
        'loadBalancer',
        function(oldVal: any, newVal: any) {
          if (oldVal !== newVal) {
            $scope.isEdit = false;
          }
        },
        true,
      );
      this.submit = function() {
        const descriptor = isNew ? 'Create' : 'Update';
        $scope.taskMonitor.submit(function() {
          const params = {
            cloudProvider: 'alicloud',
            appName: application.name,
            clusterName: $scope.loadBalancer.clusterName,
            resourceGroupName: $scope.loadBalancer.clusterName,
            loadBalancerName: $scope.loadBalancer.name,
            regionId: $scope.loadBalancer.region,
            subnetId: $scope.loadBalancer.vSwitchId,
          };
          $scope.loadBalancer.name =
            application.name + '-' + $scope.loadBalancer.stack + '-' + $scope.loadBalancer.detail;
          if ($scope.loadBalancer.selectedVnet) {
            $scope.loadBalancer.vnet = $scope.loadBalancer.selectedVnet.name;
            $scope.loadBalancer.vnetResourceGroup = $scope.loadBalancer.selectedVnet.resourceGroup;
          }

          if ($scope.loadBalancer.selectedSubnet) {
            $scope.loadBalancer.subnet = $scope.loadBalancer.selectedSubnet.vswitchId;
          }

          const name = $scope.loadBalancer.clusterName || $scope.loadBalancer.name;
          const ruleNameBase = name + '-rule';
          $scope.loadBalancer.type = 'upsertLoadBalancer';
          if (!$scope.loadBalancer.vnet && !$scope.loadBalancer.subnetType) {
            $scope.loadBalancer.securityGroups = null;
          }
          $scope.loadBalancer.moniker = {
            app: application.name,
            stack: $scope.loadBalancer.stack,
            detail: $scope.loadBalancer.detail,
            cluster: $scope.loadBalancer.clusterName,
          };

          $scope.loadBalancer.loadBalancingRules.forEach((rule: any, index: number) => {
            rule.ruleName = ruleNameBase + index;
          });

          return LoadBalancerWriter.upsertLoadBalancer($scope.loadBalancer, application, descriptor, params);
        });
      };

      this.cancel = function() {
        $uibModalInstance.dismiss();
      };
    },
  ]);
