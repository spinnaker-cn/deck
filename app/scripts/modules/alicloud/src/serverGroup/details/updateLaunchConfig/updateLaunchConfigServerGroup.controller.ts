'use strict';

const angular = require('angular');

import { API, TaskMonitor } from '@spinnaker/core';
import { SERVER_GROUP_WRITER_ALI } from '../serverGroupWirter'

export const ALICLOUD_SERVERGROUP_DETAIL_UPDATELAUNCHCONFIG = 'spinnaker.alicloud.serverGroup.details.updateLaunchConfig.controller';
angular
  .module(ALICLOUD_SERVERGROUP_DETAIL_UPDATELAUNCHCONFIG, [
    // SERVER_GROUP_WRITER,
    SERVER_GROUP_WRITER_ALI,
    require('../../../common/footer.directive').name,
  ])
  .controller('alicloudUpdateLaunchConfigServerGroupCtrl', [
    '$scope',
    '$uibModalInstance',
    'serverGroupWriters',
    'application',
    'serverGroup',
    function($scope: any, $uibModalInstance: any, serverGroupWriters: any, application: any, serverGroup: any) {
      $scope.serverGroup = serverGroup;
      $scope.searchImages = null;
      $scope.keyPairs = [];
      $scope.ImageId = [];
      $scope.instanceType = [];
      $scope.isvalid = false;
      $scope.verification = {};
      const tag: any = {};
      $scope.serverGroup.result.scalingConfiguration.tags.forEach((item: any) => {
        const key: string = item.key;
        tag[key] = item.value
      });
      $scope.serverGroup.scalingConfigurations = {
        'tags': tag,
      };
      $scope.serverGroup.instanceTags = {};
      $scope.command = {
        'systemDiskSize' : $scope.serverGroup.result.scalingConfiguration.systemDiskSize,
        'systemDiskCategory' : $scope.serverGroup.result.scalingConfiguration.systemDiskCategory,
        'tags' : JSON.parse(JSON.stringify($scope.serverGroup.result.scalingConfiguration.tags)),
        'loadBalancerWeight' : $scope.serverGroup.result.scalingConfiguration.loadBalancerWeight,
        'internetMaxBandwidthOut' : $scope.serverGroup.result.scalingConfiguration.internetMaxBandwidthOut,
        'spotStrategy': $scope.serverGroup.result.scalingConfiguration.spotStrategy,
        'keyPairName': $scope.serverGroup.result.scalingConfiguration.keyPairName,
        'instanceType': $scope.serverGroup.result.scalingConfiguration.instanceType
      };
      $scope.$watch('serverGroup.result.scalingConfiguration.systemDiskSize', function(oldVal: any, newVal: any) {
        if (newVal !== oldVal) {
          $scope.isvalid = true
        }
      });
      $scope.$watch('serverGroup.result.scalingConfiguration.systemDiskCategory', function(oldVal: any, newVal: any) {
        if (newVal !== oldVal) {
          $scope.isvalid = true
        }
      });
      $scope.$watch('serverGroup.scalingConfigurations.tags', function(oldVal: any, newVal: any) {
        if (newVal !== oldVal) {
          $scope.isvalid = true
        }
      }, true);
      $scope.$watch('serverGroup.result.scalingConfiguration.loadBalancerWeight', function(oldVal: any, newVal: any) {
        if (newVal !== oldVal) {
          $scope.isvalid = true
        }
      });
      $scope.$watch('serverGroup.result.scalingConfiguration.internetMaxBandwidthOut', function(oldVal: any, newVal: any) {
        if (newVal !== oldVal) {
          $scope.isvalid = true
        }
      });
      $scope.$watch('serverGroup.result.scalingConfiguration.spotStrategy', function(oldVal: any, newVal: any) {
        if (newVal !== oldVal) {
          $scope.isvalid = true
        }
      });
      $scope.$watch('serverGroup.result.scalingConfiguration.spotPriceLimit[0].priceLimit', function(oldVal: any, newVal: any) {
        if (newVal !== oldVal) {
          $scope.isvalid = true
        }
      });
      $scope.$watch('serverGroup.result.scalingConfiguration.instanceType', function(oldVal: any, newVal: any) {
        if (newVal !== oldVal) {
          $scope.isvalid = true
        }
      });
      $scope.$watch('serverGroup.result.scalingConfiguration.instanceTypes', function(oldVal: any, newVal: any) {
        if (newVal !== oldVal) {
          $scope.isvalid = true
        }
      });
      $scope.$watch('serverGroup.result.scalingConfiguration.keyPairName', function(oldVal: any, newVal: any) {
        if (newVal !== oldVal) {
          $scope.isvalid = true
        }
      });
      $scope.$watch('serverGroup.result.scalingConfiguration.imageId', function(oldVal: any, newVal: any) {
        if (newVal !== oldVal) {
          $scope.isvalid = true
        }
      });

      API.one('keyPairs')
        .get()
        .then(function(pairs: any) {
          const pairval: any[] = [];
          pairs.forEach((item: any) => {
            if (item.account === $scope.serverGroup.account) {
              pairval.push(item.keyName)
            }
          });
          $scope.keyPairs = pairval
        });

      API.one('instanceTypes')
        .get()
        .then(function(types: any) {
          API.one('subnets/alicloud').getList().then((vnets: any) => {
            const subnets: any[] = [];
            vnets.forEach((vnet: any) => {
              if (vnet.account === $scope.serverGroup.account && vnet.region === $scope.serverGroup.region) {
                subnets.push(vnet);
              }
            });
            let zoneIds = '';
            subnets.forEach((item: any) => {
              if (item.vswitchId === $scope.serverGroup.result.scalingGroup.vswitchId) {
                return zoneIds = item.zoneId
              }
            });
            let typeval: any[] = [];
            types.forEach((item: any) => {
              if (item.account === $scope.serverGroup.account && item.regionId === $scope.serverGroup.region && item.zoneId === zoneIds) {
                typeval = typeval.concat(item.instanceTypes)
              }
            });
            $scope.instanceType = typeval;
          });
        });

      $scope.taskMonitor = new TaskMonitor({
        application: application,
        title: 'UpdateSecurityGroupsFor' + serverGroup.name,
        modalInstance: $uibModalInstance,
      });

      this.submit = function() {
        if ($scope.serverGroup.result.scalingConfiguration.spotStrategy !== 'SpotWithPriceLimit') {
          if ($scope.serverGroup.result.scalingConfiguration.spotPriceLimit && $scope.serverGroup.result.scalingConfiguration.spotPriceLimit.length > 0 ) {
            delete $scope.serverGroup.result.scalingConfiguration.spotPriceLimit[0]
            delete $scope.serverGroup.result.scalingConfiguration.spotPriceLimit
          }
        } else {
          // $scope.serverGroup.result.scalingConfiguration.spotPriceLimit[0].instanceType = $scope.serverGroup.result.scalingConfiguration.instanceType;
          // $scope.serverGroup.result.scalingConfiguration.spotPriceLimit[0].priceLimit = parseFloat($scope.serverGroup.result.scalingConfiguration.spotPriceLimit[0].priceLimit);
        }
        const serverGroups = $scope.serverGroup;
        serverGroups.result.scalingConfiguration.tags = angular.toJson(serverGroups.scalingConfigurations.tags);
        const submitMethod = function() {
          return serverGroupWriters.updateLaunchConfigs(serverGroups, application);
        };
        $scope.taskMonitor.submit(submitMethod);
      };

      this.cancel = function() {
        $uibModalInstance.dismiss();
      };
    },
  ]);
