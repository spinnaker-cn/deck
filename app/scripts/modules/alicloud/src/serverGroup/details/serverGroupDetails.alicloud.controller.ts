'use  strict';

import * as _ from 'lodash';

const angular = require('angular');
import {
  CONFIRMATION_MODAL_SERVICE,
  ServerGroupReader,
  ServerGroupWarningMessageService,
  SERVER_GROUP_WRITER,
  FirewallLabels,
} from '@spinnaker/core';
import { ALICLOUD_SERVERGROUP_COMMSNDBUILDER } from '../configure/serverGroupCommandBuilder.service';
import { ALICLOUD_DETAILS_RESIZE } from './resize/resizeServerGroup.controller';
import { ALICLOUD_SERVERGROUP_DETAIL_SCLAINGGROUP } from './reScalingGroup/reScalingGroupServerGroup.controller';
import { ALICLOUD_SERVERGROUP_DETAIL_UPDATESECURITY } from './updateSecurityGroup/updateSecurityGroupServerGroup.controller';
import { ALICLOUD_SERVERGROUP_DETAIL_UPDATELAUNCHCONFIG } from './updateLaunchConfig/updateLaunchConfigServerGroup.controller';
import { ALICLOUD_DETAILS_ROLLBACK } from './rollback/rollbackServerGroup.controller';
//  import  {  AlicloudReScalingServerGroupModal  }  from  './reScalingGroup/AlicloudReScalingServerGroupModal';
//  import  {  AlicloudResizeServerGroupModal  }  from  './resize/AlicloudResizeServerGroupModal';
//  import  {  AlicloudRollbackServerGroupModal  }  from  './rollback/AlicloudRollbackServerGroupModal';
//  import  {  AlicloudUpdateServerGroupModal  }  from  './updateSecurityGroup/AlicloudUpdateServerGroupModal'
//  import  {  UpdateLaunchConfigServerGroup  }  from  './updateLaunchConfig/UpdateLaunchConfigServerGroup'

export const ALICLOUD_SERVERGROUP_DETAILSCTRL = 'spinnaker.alicloud.serverGroup.details.controller';
angular
  .module(ALICLOUD_SERVERGROUP_DETAILSCTRL, [
    require('@uirouter/angularjs').default,
    ALICLOUD_SERVERGROUP_COMMSNDBUILDER,
    ALICLOUD_DETAILS_RESIZE,
    ALICLOUD_SERVERGROUP_DETAIL_SCLAINGGROUP,
    ALICLOUD_SERVERGROUP_DETAIL_UPDATESECURITY,
    ALICLOUD_SERVERGROUP_DETAIL_UPDATELAUNCHCONFIG,
    CONFIRMATION_MODAL_SERVICE,
    SERVER_GROUP_WRITER,
    ALICLOUD_DETAILS_ROLLBACK,
  ])
  .controller('alicloudServerGroupDetailsCtrl', [
    '$scope',
    '$state',
    '$templateCache',
    'app',
    'serverGroup',
    '$uibModal',
    'confirmationModalService',
    'serverGroupWriter',
    function(
      $scope: any,
      $state: any,
      _$templateCache: any,
      app: any,
      serverGroup: any,
      $uibModal: any,
      confirmationModalService: any,
      serverGroupWriter: any,
    ) {
      $scope.state = {
        loading: true,
      };

      $scope.firewallsLabel = FirewallLabels.get('Firewalls');

      this.application = app;

      function extractServerGroupSummary() {
        let summary: any = _.find(app.serverGroups.data, function(toCheck: any) {
          return (
            toCheck.name === serverGroup.name &&
            toCheck.account === serverGroup.accountId &&
            toCheck.region === serverGroup.region
          );
        });
        if (!summary) {
          app.loadBalancers.data.some(function(loadBalancer: any) {
            if (loadBalancer.account === serverGroup.accountId && loadBalancer.region === serverGroup.region) {
              return loadBalancer.serverGroups.some(function(possibleServerGroup: any) {
                if (possibleServerGroup.name === serverGroup.name) {
                  summary = possibleServerGroup;
                  return true;
                } else {
                  return false;
                }
              });
            }
          });
        }
        if (!summary) {
          $state.go('^');
        }
        return summary;
      }

      function retrieveServerGroup() {
        const summary = extractServerGroupSummary();
        return ServerGroupReader.getServerGroup(
          app.name,
          serverGroup.accountId,
          serverGroup.region,
          serverGroup.name,
        ).then(function(details: any) {
          cancelLoader();
          angular.extend(details, summary);
          details.account = serverGroup.accountId;
          $scope.serverGroup = details;
          if (!_.isEmpty($scope.serverGroup)) {
            $scope.image = details.image ? details.image : undefined;
            if (details.image && details.image.description) {
              const tags: any[] = details.image.description.split(',');
              tags.forEach(function(tag) {
                const keyVal: any[] = tag.split('=');
                if (keyVal.length === 2 && keyVal[0] === 'ancestor_name') {
                  details.image.baseImage = keyVal[1];
                }
              });
            }
            if (details.launchConfig && details.launchConfig.securityGroups) {
              $scope.securityGroups = _.chain(details.launchConfig.securityGroups)
                .map(function(id: any) {
                  return (
                    _.find(app.securityGroups.data, {
                      accountName: serverGroup.accountId,
                      region: serverGroup.region,
                      id: id,
                    }) ||
                    _.find(app.securityGroups.data, {
                      accountName: serverGroup.accountId,
                      region: serverGroup.region,
                      name: id,
                    })
                  );
                })
                .compact()
                .value();
            }
          } else {
            $state.go('^');
          }
        });
      }

      function cancelLoader() {
        $scope.state.loading = false;
      }

      retrieveServerGroup().then(() => {
        if (!$scope.$$destroyed) {
          app.serverGroups.onRefresh($scope, retrieveServerGroup);
        }
      });
      this.destroyServerGroup = function destroyServerGroup() {
        const serverGroups = $scope.serverGroup;
        const taskMonitor = {
          application: app,
          title: 'Destroying ' + serverGroup.name,
        };
        const submitMethod = function() {
          return serverGroupWriter.destroyServerGroup(serverGroups, app);
        };
        const stateParams = {
          name: serverGroup.name,
          accountId: serverGroup.account,
          region: serverGroup.region,
        };
        const confirmationModalParams = {
          header: 'Really destroy ' + serverGroup.name + '?',
          buttonText: 'Destroy ' + serverGroup.name,
          account: serverGroup.account,
          taskMonitorConfig: taskMonitor,
          submitMethod: submitMethod,
          onTaskComplete: function() {
            if ($state.includes('**.serverGroup', stateParams)) {
              $state.go('^');
            }
          },
        };
        ServerGroupWarningMessageService.addDestroyWarningMessage(app, serverGroup, confirmationModalParams);
        confirmationModalService.confirm(confirmationModalParams);
      };

      this.disableServerGroup = function disableServerGroup() {
        const serverGroups = $scope.serverGroup;
        const taskMonitor = {
          application: app,
          title: 'Disabling ' + serverGroup.name,
        };
        if ($scope.serverGroup.instanceCounts) {
          $scope.serverGroup.instanceCounts = {
            up: 1,
          };
        }
        const submitMethod = () => serverGroupWriter.disableServerGroup(serverGroups, app);
        const confirmationModalParams = {
          header: 'Really disable ' + serverGroup.name + '?',
          buttonText: 'Disable ' + serverGroup.name,
          account: serverGroup.account,
          taskMonitorConfig: taskMonitor,
          submitMethod: submitMethod,
        };
        confirmationModalService.confirm(confirmationModalParams);
      };

      this.cloneServerGroup = function cloneServerGroup() {
        let loadBalancerIdsData = `[`;
        $scope.serverGroup.result.scalingGroup.loadBalancerIds.map((res: any, index: any) => {
          if (index === $scope.serverGroup.result.scalingGroup.loadBalancerIds.length - 1) {
            loadBalancerIdsData += `'${res}']`;
          } else {
            loadBalancerIdsData += `'${res}',`;
          }
        });
        $scope.serverGroup.scalingGroupName = $scope.serverGroup.serverGroupName;
        $scope.serverGroup.application = $scope.serverGroup.result.application;
        $scope.serverGroup.credentials = $scope.serverGroup.result.account;
        $scope.serverGroup.region = $scope.serverGroup.result.regionId;
        $scope.serverGroup.scalingGroupName = $scope.serverGroup.moniker.cluster;
        $scope.serverGroup.name = $scope.serverGroup.moniker.cluster;
        $scope.serverGroup.minSize = $scope.serverGroup.capacity.min;
        $scope.serverGroup.maxSize = $scope.serverGroup.capacity.max;
        $scope.serverGroup.defaultCooldown = $scope.serverGroup.result.scalingGroup.defaultCooldown;
        $scope.serverGroup.cloudProvider = $scope.serverGroup.result.provider;
        $scope.serverGroup.selectedProvider = $scope.serverGroup.result.provider;
        $scope.serverGroup.loadBalancerIds = loadBalancerIdsData;
        $scope.serverGroup.vServerGroups = $scope.serverGroup.result.scalingGroup.vserverGroups;
        $scope.serverGroup.multiAZPolicy = $scope.serverGroup.result.scalingGroup.multiAZPolicy;
        $scope.serverGroup.scalingPolicy = $scope.serverGroup.result.scalingGroup.scalingPolicy;
        $scope.serverGroup.freeFormDetails = $scope.serverGroup.detail;
        $scope.serverGroup.viewState = {
          mode: 'create',
        };
        $scope.serverGroup.source = {
          asgName: $scope.serverGroup.moniker.cluster,
        };
        $scope.serverGroup.vSwitchId = $scope.serverGroup.result.scalingGroup.vswitchId;
        $scope.serverGroup.vSwitchIds = $scope.serverGroup.result.scalingGroup.vswitchIds;
        $scope.serverGroup.vSwitchName = $scope.serverGroup.result.scalingGroup.vswitchName;
        $scope.serverGroup.systemDiskCategory = $scope.serverGroup.result.scalingConfiguration.systemDiskCategory;
        $scope.serverGroup.systemDiskSize = $scope.serverGroup.result.scalingConfiguration.systemDiskSize;
        $scope.serverGroup.scalingConfigurations = $scope.serverGroup.result.scalingConfiguration;
        const tags: any = {};
        $scope.serverGroup.scalingConfigurations.tags = $scope.serverGroup.scalingConfigurations.tags.map(
          (item: any) => {
            const key: string = item.key;
            tags[key] = item.value;
            return tags;
          },
        );
        $scope.serverGroup.scalingConfigurations.multiAZPolicy = $scope.serverGroup.result.scalingGroup.multiAZPolicy;
        $scope.serverGroup.scalingConfigurations.scalingPolicy = $scope.serverGroup.result.scalingGroup.scalingPolicy;
        const serverGroups = $scope.serverGroup;
        const taskMonitor = {
          application: app,
          title: 'Clone ' + serverGroup.name,
        };
        const submitMethod = () => serverGroupWriter.cloneServerGroup(serverGroups, app);
        const confirmationModalParams = {
          header: 'Really clone ' + serverGroup.name + '?',
          buttonText: 'Clone ' + serverGroup.name,
          account: serverGroup.account,
          taskMonitorConfig: taskMonitor,
          submitMethod: submitMethod,
        };
        confirmationModalService.confirm(confirmationModalParams);
      };

      this.enableServerGroup = function enableServerGroup() {
        $scope.serverGroup.scalingGroupName = $scope.serverGroup.serverGroupName;
        const serverGroups = $scope.serverGroup;
        const taskMonitor = {
          application: app,
          title: 'Enabling ' + serverGroup.name,
        };
        const submitMethod = (params: any) => {
          return serverGroupWriter.enableServerGroup(
            serverGroups,
            app,
            angular.extend(params, {
              interestingHealthProviderNames: [], // bypass the check for now; will change this later to ['alicloudService']
            }),
          );
        };
        confirmationModalService.confirm({
          header: 'Really enable ' + serverGroup.name + '?',
          buttonText: 'Enable ' + serverGroup.name,
          account: serverGroup.account,
          taskMonitorConfig: taskMonitor,
          submitMethod: submitMethod,
        });
      };

      this.rollbackServerGroup = () => {
        const serverGroups = $scope.serverGroup;
        // const cluster = _.find(app.clusters, {
        //   name: serverGroups.cluster,
        //   account: serverGroups.account,
        //   serverGroups: [],
        // });
        // const disableServerGroups =  _.filter(cluster.serverGroups, { isDisabled: true, region: serverGroups.region });
        // AlicloudRollbackServerGroupModal.show({ application: app, serverGroup: serverGroups, disabledServerGroups: disableServerGroups, });
        $uibModal.open({
          templateUrl: require('./rollback/rollbackServerGroup.html'),
          controller: 'alicloudRollbackServerGroupCtrl as ctrl',
          resolve: {
            serverGroup: () => serverGroups,
            disabledServerGroups: () => {
              const cluster = _.find(app.clusters, {
                name: serverGroups.cluster,
                account: serverGroups.account,
                serverGroups: [],
              });
              return _.filter(cluster.serverGroups, { isDisabled: true, region: serverGroups.region });
            },
            application: () => app,
          },
        });
      };

      this.resizeServerGroup = () => {
        const serverGroups = $scope.serverGroup;
        // AlicloudResizeServerGroupModal.show({ application: app, serverGroup: serverGroups });
        $uibModal.open({
          templateUrl: require('./resize/resizeServerGroup.html'),
          controller: 'alicloudResizeServerGroupCtrl as ctrl',
          resolve: {
            serverGroup: () => serverGroups,
            application: () => app,
          },
        });
      };

      this.reScalingGroupServerGroup = () => {
        const serverGroups = $scope.serverGroup;
        // AlicloudReScalingServerGroupModal.show({ application: app, serverGroup: serverGroups });
        $uibModal.open({
          templateUrl: require('./reScalingGroup/reScalingGroupServerGroup.html'),
          controller: 'alicloudReScalingGroupServerGroupCtrl as ctrl',
          resolve: {
            serverGroup: () => serverGroups,
            application: () => app,
          },
        });
      };

      this.updateSecurityGroupServerGroup = () => {
        const serverGroups = $scope.serverGroup;
        // AlicloudUpdateServerGroupModal.show({ application: app, serverGroup: serverGroups });
        $uibModal.open({
          templateUrl: require('./updateSecurityGroup/updateSecurityGroupServerGroup.html'),
          controller: 'alicloudUpdateSecurityGroupServerGroupCtrl as ctrl',
          resolve: {
            serverGroup: () => serverGroups,
            application: () => app,
          },
        });
      };

      this.updateLaunchConfigServerGroup = () => {
        const serverGroups = $scope.serverGroup;
        // UpdateLaunchConfigServerGroup.show({ application: app, serverGroup: serverGroups })
        $uibModal.open({
          templateUrl: require('./updateLaunchConfig/updateLaunchConfigServerGroup.html'),
          controller: 'alicloudUpdateLaunchConfigServerGroupCtrl as ctrl',
          resolve: {
            serverGroup: () => serverGroups,
            application: () => app,
          },
        });
      };

      this.truncateCommitHash = function() {
        if ($scope.serverGroup && $scope.serverGroup.buildInfo && $scope.serverGroup.buildInfo.commit) {
          return $scope.serverGroup.buildInfo.commit.substring(0, 8);
        }
        return null;
      };
    },
  ]);
