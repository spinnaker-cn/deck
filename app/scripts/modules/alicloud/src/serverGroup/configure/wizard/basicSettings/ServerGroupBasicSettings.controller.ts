'use strict';

import { IMAGE_READER, ModalWizard, API } from '@spinnaker/core';
import { ALICLOUD_SERVERGROUP_IMAGE } from './image.regional.filter';

const angular = require('angular');

export const ALICLOUD_SERVERGROUP_BASICSETTING = 'spinnaker.alicloud.serverGroup.configure.basicSettings';
angular
  .module(ALICLOUD_SERVERGROUP_BASICSETTING , [
    require('@uirouter/angularjs').default,
    require('angular-ui-bootstrap'),
    ALICLOUD_SERVERGROUP_IMAGE,
    IMAGE_READER,
  ])
  .controller('alicloudServerGroupBasicSettingsCtrl', [
    '$scope',
    '$controller',
    '$uibModalStack',
    '$state',
    'imageReader',
    function($scope: any, $controller: any, $uibModalStack: any, $state: any, imageReader: any) {
      $scope.selectedSubnets = [];
      $scope.instanceType = [];
      $scope.subns = [];
      $scope.zoneIds = [];
      $scope.command.regionInput = [];
      $scope.command.selectedProvider = 'alicloud';
      const rinput: any[] = [];
      $scope.command.backingData.filtered.regions.forEach((item: any) => {
        rinput.push({ 'name': item })
      });
      $scope.command.backingData.filtered.regions = rinput;

      $scope.$watch('form.$valid', function(newVal: any) {
        if (newVal) {
          ModalWizard.markClean('basic-settings');
          ModalWizard.markComplete('basic-settings');
        } else {
          ModalWizard.markIncomplete('basic-settings');
        }
      });

      $scope.$watch('command.region', function( newVal: any, oldVal: any) {
        if (newVal) {
          API.one('subnets/alicloud').getList().then((vnets: any) => {
            const subnets: any[] = [];
            vnets.forEach((vnet: any) => {
              if (vnet.account === $scope.command.credentials && vnet.region === $scope.command.region) {
                subnets.push(vnet);
              }
            });
            $scope.selectedSubnets = subnets;
            const subn: any[] = [];
            $scope.selectedSubnets.forEach((vnet: any) => {
              if (vnet.zoneId === $scope.command.masterZoneId) {
                subn.push(vnet)
              }
            });
            $scope.subns = subn;
            const zoneIds = subnets.map((item) => {
              return item.zoneId
            });
            $scope.zoneIds = Array.from(new Set(zoneIds))
          });
          if (oldVal !== newVal) {
            $scope.command.masterZoneId = null;
            $scope.command.vSwitchId = null;
          }
        } else {
          return;
        }
      });

      $scope.$watch('command.masterZoneId', function(newVal: any, oldVal: any ) {
        if (newVal) {
          const subn: any[] = [];
          $scope.selectedSubnets.forEach((vnet: any) => {
            if (vnet.zoneId === $scope.command.masterZoneId) {
              subn.push(vnet)
            }
          });
          $scope.subns = subn
          if (oldVal !== newVal) {
            $scope.command.vSwitchId = null;

          }
        } else {
          return
        }
      });

      this.selectedSubnetChanged = function(subnet: any) {
        $scope.command.vSwitchId = subnet.vswitchId;
        $scope.command.vSwitchName = subnet.vswitchName;
        $scope.command.vpcId = subnet.vpcId;
      };

      this.useSourceCapacityUpdated = function() {
        $scope.command.useSourceCapacity = $scope.command.useSourceCapacity ? false : true;
      };

      this.imageChanged = (image: any) => {
        $scope.command.imageName = image.imageName;
        $scope.command.selectedImage = image;
        ModalWizard.markClean('basic-settings');
      };

      angular.extend(
        this,
        $controller('BasicSettingsMixin', {
          $scope: $scope,
          imageReader: imageReader,
          $uibModalStack: $uibModalStack,
          $state: $state,
        }),
      );

      this.stackPattern = {
        test: function(stack: any) {
          const pattern = $scope.command.viewState.templatingEnabled ? /^([a-zA-Z0-9]*(\${.+})*)*$/ : /^[a-zA-Z0-9]*$/;
          return pattern.test(stack);
        },
      };

      this.detailPattern = {
        test: function(detail: any) {
          const pattern = $scope.command.viewState.templatingEnabled ? /^([a-zA-Z0-9-]*(\${.+})*)*$/ : /^[a-zA-Z0-9-]*$/;
          return pattern.test(detail);
        },
      };

      this.minSizePattern = {
        test: function(MinSize: number) {
          if (MinSize > $scope.command.maxSize) {
            return false;
          } else {
            return true;
          }
        },
      };

      this.maxSizePattern = {
        test: function(MaxSize: number) {
          if (MaxSize < $scope.command.minSize) {
            return false;
          } else {
            return true;
          }
        },
      };
    },
  ]);
