'use strict';

const angular = require('angular');
import * as _ from 'lodash';

import {
  CloudProviderRegistry,
  CONFIRMATION_MODAL_SERVICE,
  InstanceReader,
  INSTANCE_WRITE_SERVICE,
  InstanceTemplates,
  RecentHistoryService,
} from '@spinnaker/core';

export const ALICLOUD_INSTANCE_DETAILCTRL = 'spinnaker.alicloud.instance.detail.controller';
angular
  .module(ALICLOUD_INSTANCE_DETAILCTRL, [
    require('@uirouter/angularjs').default,
    require('angular-ui-bootstrap'),
    INSTANCE_WRITE_SERVICE,
    CONFIRMATION_MODAL_SERVICE,
  ])
  .controller('alicloudInstanceDetailsCtrl', [
    '$scope',
    '$state',
    '$uibModal',
    'instanceWriter',
    'confirmationModalService',
    'instance',
    'app',
    '$q',
    function(
      $scope: any,
      $state: any,
      $uibModal: any,
      instanceWriter: any,
      confirmationModalService: any,
      instance: any,
      app: any,
      $q: any,
    ) {
      $scope.detailsTemplateUrl = CloudProviderRegistry.getValue('alicloud', 'instance.detailsTemplateUrl');
      $scope.state = {
        loading: true,
        standalone: app.isStandalone,
      };

      function extractHealthMetrics(instances: any, latest: any): any {
        if (app.isStandalone) {
          instances.health = latest.health;
        }

        instances.health = instances.health || [];
        const displayableMetrics = instances.health.filter(function(metric: any) {
          return metric.type !== 'AliCloud' || metric.state !== 'Unknown';
        });
        // backfill details where applicable
        if (latest.health) {
          displayableMetrics.forEach(function(metric: any) {
            const detailsMatch = latest.health.filter(function(latestHealth: any) {
              return latestHealth.type === metric.type;
            });
            if (detailsMatch.length) {
              _.defaults(metric, detailsMatch[0]);
            }
          });
        }
        $scope.healthMetrics = displayableMetrics;
      }

      function retrieveInstance(): any {
        const extraData: any = {};
        let instanceSummary: any, loadBalancers: any, account: string, region: string, vpcId: string;
        if (!app.serverGroups) {
          instanceSummary = {};
          loadBalancers = [];
          account = instance.account;
          region = instance.region;
        } else {
          app.serverGroups.data.some(function(serverGroup: any) {
            return serverGroup.instances.some(function(possibleInstance: any) {
              if (possibleInstance.id === instance.instanceId) {
                instanceSummary = possibleInstance;
                loadBalancers = serverGroup.loadBalancers;
                account = serverGroup.account;
                region = serverGroup.region;
                vpcId = serverGroup.vpcId;
                extraData.serverGroup = serverGroup.name;
                extraData.vpcId = serverGroup.vpcId;
                return true;
              } else {
                return false;
              }
            });
          });
          if (!instanceSummary) {
            app.loadBalancers.data.some(function(loadBalancer: any) {
              return loadBalancer.instances.some(function(possibleInstance: any) {
                if (possibleInstance.id === instance.instanceId) {
                  instanceSummary = possibleInstance;
                  loadBalancers = [loadBalancer.name];
                  account = loadBalancer.account;
                  region = loadBalancer.region;
                  vpcId = loadBalancer.vpcId;
                  return true;
                } else {
                  return false;
                }
              });
            });
            if (!instanceSummary) {
              app.loadBalancers.data.some(function(loadBalancer: any): any {
                return loadBalancer.serverGroups.some(function(serverGroup: any) {
                  if (!serverGroup.isDisabled) {
                    return false;
                  }
                  return serverGroup.instances.some(function(possibleInstance: any): any {
                    if (possibleInstance.id === instance.instanceId) {
                      instanceSummary = possibleInstance;
                      loadBalancers = [loadBalancer.name];
                      account = loadBalancer.account;
                      region = loadBalancer.region;
                      vpcId = loadBalancer.vpcId;
                      return true;
                    }
                  });
                });
              });
            }
          }
        }

        if (instanceSummary && account && region) {
          extraData.account = account;
          extraData.region = region;
          RecentHistoryService.addExtraDataToLatest('instances', extraData);
          return InstanceReader.getInstanceDetails(account, region, instance.instanceId).then(
            function(details: any) {
              $scope.state.loading = false;
              extractHealthMetrics(instanceSummary, details);
              $scope.instance = _.defaults(details, instanceSummary);
              $scope.instance.account = account;
              $scope.instance.region = region;
              $scope.instance.vpcId = vpcId;
              $scope.instance.loadBalancers = loadBalancers;
              const discoveryMetric = _.find($scope.healthMetrics, function(metric: any) {
                return metric.type === 'Discovery';
              });
              if (discoveryMetric && discoveryMetric.vipAddress) {
                const vipList = discoveryMetric.vipAddress;
                $scope.instance.vipAddress = vipList.includes(',') ? vipList.split(',') : [vipList];
              }
              $scope.baseIpAddress = details.publicDnsName || details.privateIpAddress;
            },
            function() {
              $scope.state.loading = false;
              $state.go('^');
            },
          );
        }

        if (!instanceSummary) {
          $scope.instanceIdNotFound = instance.attributes.instanceId;
          $scope.state.loading = false;
        }

        return $q.when(null);
      }

      this.canDeregisterFromLoadBalancer = function(): any {
        return $scope.instance.health.some(function(health: any) {
          return health.type === 'LoadBalancer';
        });
      };

      this.canRegisterWithLoadBalancer = function() {
        const instances = $scope.instance;
        if (!instances.loadBalancers || !instances.loadBalancers.length) {
          return false;
        }
        const outOfService = instances.health.some(function(health: any) {
          return health.type === 'LoadBalancer' && health.state === 'OutOfService';
        });
        const hasLoadBalancerHealth = instances.health.some(function(health: any) {
          return health.type === 'LoadBalancer';
        });
        return outOfService || !hasLoadBalancerHealth;
      };

      this.canRegisterWithDiscovery = function() {
        const instances = $scope.instance;
        const discoveryHealth = instances.health.filter(function(health: any) {
          return health.type === 'Discovery';
        });
        return discoveryHealth.length ? discoveryHealth[0].state === 'OutOfService' : false;
      };

      this.terminateInstance = function terminateInstance() {
        const instances = $scope.instance;

        const taskMonitor = {
          application: app,
          title: 'Terminating ' + instances.instanceId,
          onTaskComplete: function() {
            if ($state.includes('**.instanceDetails', { instanceId: instances.instanceId })) {
              $state.go('^');
            }
          },
        };

        const submitMethod = function() {
          return instanceWriter.terminateInstance(instance, app);
        };

        confirmationModalService.confirm({
          header: 'Really terminate ' + instances.instanceId + '?',
          buttonText: 'Terminate ' + instances.instanceId,
          account: instances.account,
          provider: 'alicloud',
          taskMonitorConfig: taskMonitor,
          submitMethod: submitMethod,
        });
      };

      this.terminateInstanceAndShrinkServerGroup = function terminateInstanceAndShrinkServerGroup() {
        const instances = $scope.instance;

        const taskMonitor = {
          application: app,
          title: 'Terminating ' + instances.instanceId + ' and shrinking server group',
          onTaskComplete: function() {
            if ($state.includes('**.instanceDetails', { instanceId: instances.instanceId })) {
              $state.go('^');
            }
          },
        };

        const submitMethod = function() {
          return instanceWriter.terminateInstanceAndShrinkServerGroup(instances, app);
        };

        confirmationModalService.confirm({
          header: 'Really terminate ' + instances.instanceId + ' and shrink ' + instances.serverGroup + '?',
          buttonText: 'Terminate ' + instances.instanceId + ' and shrink ' + instances.serverGroup,
          account: instances.account,
          provider: 'alicloud',
          taskMonitorConfig: taskMonitor,
          submitMethod: submitMethod,
        });
      };

      this.rebootInstance = function rebootInstance() {
        const instances = $scope.instance;

        const taskMonitor = {
          application: app,
          title: 'Rebooting ' + instances.instanceId,
        };

        const submitMethod = function() {
          return instanceWriter.rebootInstance(instances, app);
        };

        confirmationModalService.confirm({
          header: 'Really reboot ' + instances.instanceId + '?',
          buttonText: 'Reboot ' + instances.instanceId,
          account: instances.account,
          provider: 'alicloud',
          taskMonitorConfig: taskMonitor,
          submitMethod: submitMethod,
        });
      };

      this.registerInstanceWithLoadBalancer = function registerInstanceWithLoadBalancer() {
        const instances = $scope.instance;
        const loadBalancerNames = instances.loadBalancers.join(' and ');

        const taskMonitor = {
          application: app,
          title: 'Registering ' + instances.instanceId + ' with ' + loadBalancerNames,
        };

        const submitMethod = function() {
          return instanceWriter.registerInstanceWithLoadBalancer(instances, app);
        };

        confirmationModalService.confirm({
          header: 'Really register ' + instances.instanceId + ' with ' + loadBalancerNames + '?',
          buttonText: 'Register ' + instances.instanceId,
          account: instances.account,
          taskMonitorConfig: taskMonitor,
          submitMethod: submitMethod,
        });
      };

      this.deregisterInstanceFromLoadBalancer = function deregisterInstanceFromLoadBalancer() {
        const instances = $scope.instance;
        const loadBalancerNames = instances.loadBalancers.join(' and ');

        const taskMonitor = {
          application: app,
          title: 'Deregistering ' + instances.instanceId + ' from ' + loadBalancerNames,
        };

        const submitMethod = function() {
          return instanceWriter.deregisterInstanceFromLoadBalancer(instances, app);
        };

        confirmationModalService.confirm({
          header: 'Really deregister ' + instances.instanceId + ' from ' + loadBalancerNames + '?',
          buttonText: 'Deregister ' + instances.instanceId,
          provider: 'alicloud',
          account: instances.account,
          taskMonitorConfig: taskMonitor,
          submitMethod: submitMethod,
        });
      };

      this.enableInstanceInDiscovery = function enableInstanceInDiscovery() {
        const instances = $scope.instance;

        const taskMonitor = {
          application: app,
          title: 'Enabling ' + instances.instanceId + ' in discovery',
        };

        const submitMethod = function() {
          return instanceWriter.enableInstanceInDiscovery(instances, app);
        };

        confirmationModalService.confirm({
          header: 'Really enable ' + instances.instanceId + ' in discovery?',
          buttonText: 'Enable ' + instances.instanceId,
          account: instances.account,
          taskMonitorConfig: taskMonitor,
          submitMethod: submitMethod,
        });
      };

      this.disableInstanceInDiscovery = function disableInstanceInDiscovery() {
        const instances = $scope.instance;

        const taskMonitor = {
          application: app,
          title: 'Disabling ' + instances.instanceId + ' in discovery',
        };

        const submitMethod = function() {
          return instanceWriter.disableInstanceInDiscovery(instances, app);
        };

        confirmationModalService.confirm({
          header: 'Really disable ' + instances.instanceId + ' in discovery?',
          buttonText: 'Disable ' + instances.instanceId,
          provider: 'alicloud',
          account: instances.account,
          taskMonitorConfig: taskMonitor,
          submitMethod: submitMethod,
        });
      };

      this.showConsoleOutput = function() {
        $uibModal.open({
          templateUrl: InstanceTemplates.consoleOutputModal,
          controller: 'ConsoleOutputCtrl as ctrl',
          size: 'lg',
          resolve: {
            instance: function() {
              return $scope.instance;
            },
          },
        });
      };

      this.hasHealthState = function hasHealthState(healthProviderType: any, state: any) {
        const instances = $scope.instance;
        return instances.health.some(function(health: any) {
          return health.type === healthProviderType && health.state === state;
        });
      };

      const initialize = app.isStandalone
        ? retrieveInstance()
        : $q.all([app.serverGroups.ready(), app.loadBalancers.ready()]).then(retrieveInstance);

      initialize.then(() => {
        if (!$scope.$$destroyed && !app.isStandalone) {
          app.serverGroups.onRefresh($scope, retrieveInstance);
        }
      });

      $scope.account = instance.account;
    },
  ]);
