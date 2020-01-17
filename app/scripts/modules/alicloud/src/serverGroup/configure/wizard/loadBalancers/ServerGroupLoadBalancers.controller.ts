'use strict';

const angular = require('angular');

import { LOAD_BALANCER_READ_SERVICE, ModalWizard } from '@spinnaker/core';

export const ALICLOUD_SERVERGROUP_LOADBALANCER = 'spinnaker.alicloud.serverGroup.configure.loadBalancer.controller';
angular
  .module(ALICLOUD_SERVERGROUP_LOADBALANCER, [LOAD_BALANCER_READ_SERVICE])
  .controller('alicloudServerGroupLoadBalancersCtrl', [
    '$scope',
    'loadBalancerReader',
    function($scope: any, loadBalancerReader: any) {
      ModalWizard.markClean('load-balancers');

      function loadVnetSubnets() {
        loadBalancerReader
          .getLoadBalancerDetails(
            'alicloud',
            $scope.command.credentials,
            $scope.command.region,
            $scope.command.application,
          )
          .then(function(LBs: any) {
            let data = [];
            $scope.command.loadBalancers = [];
            if ($scope.command.vpcIds && $scope.command.vpcIds instanceof Array) {
              $scope.command.loadBalancers = LBs.map((item: any) => {
                $scope.command.vpcIds.forEach((id: any) => {
                  if (id === item.results.vpcId || item.results.vpcId === '') {
                    const obj: any = {
                      id: item.results.loadBalancerId,
                      name: item.results.loadBalancerName,
                      vServerGroups: item.results.vServerGroups,
                    };
                    data.push(obj);
                    return obj;
                  }
                });
              });
            }
            $scope.command.loadBalancers = data;
            $scope.command.selectedVnetSubnets = LBs.map((item: any) => {
              return item.results.vpcId;
            });
          });
      }

      if (!$scope.command.vServerGroups) {
        $scope.command.vServerGroups = [
          {
            loadBalancerName: undefined,
            loadBalancerId: undefined,
            ifExitloadBalancerIds: false,
            vServerGroups: [],
            vServerGroupAttributes: [
              {
                vServerGroupId: undefined,
                vServerGroupName: undefined,
                port: '',
                weight: '',
              },
            ],
          },
        ];
      }

      if ($scope.command.credentials && $scope.command.region) {
        $scope.command.viewState.networkSettingsConfigured = true;
        $scope.command.selectedVnetSubnets = [];
      }

      $scope.$watch('command.vSwitchIds', function(newVal: any) {
        if (newVal) {
          loadVnetSubnets();
        }
      });

      $scope.loadBalancerChanged = function($index: any, loadBalancerId: any, res: any) {
        $scope.command.viewState.networkSettingsConfigured = true;
        res.loadBalancerId = loadBalancerId.id;
        res.loadBalancerName = loadBalancerId.name;

        let data = $scope.command.loadBalancers;

        data = data.filter((item: any) => {
          return item !== undefined;
        });
        data.map((item: any) => {
          if (item.id === loadBalancerId.id) {
            res.vServerGroups = item.vServerGroups;
          }
        });

        let Ids: any = [];
        $scope.command.vServerGroups.map((res: any, index: any) => {
          if (index !== $index) {
            Ids.push(res.loadBalancerId);
          }
        });
        if (Ids.indexOf(res.loadBalancerId) !== -1) {
          res.ifExitloadBalancerIds = true;
        } else {
          res.ifExitloadBalancerIds = false;
        }
        res.vServerGroupAttributes.map((res: any) => {
          res.vServerGroupId = undefined;
          res.vServerGroupName = undefined;
        });
      };
      $scope.vServerGroupChanged = function(vServerGroupId: any, res: any) {
        res.vServerGroupId = vServerGroupId.vserverGroupId;
        res.vServerGroupName = vServerGroupId.vserverGroupName;
      };
      this.add = function() {
        $scope.jsonListAddNull = {
          loadBalancerName: undefined,
          loadBalancerId: undefined,
          vServerGroups: [],
          ifExitloadBalancerIds: false,
          vServerGroupAttributes: [
            {
              vServerGroupId: undefined,
              vServerGroupName: undefined,
              port: '',
              weight: '',
            },
          ],
        };
        $scope.command.vServerGroups.push($scope.jsonListAddNull);
      };
      this.addChild = function($parentIndex: any, $index: any) {
        $scope.command.vServerGroups[$parentIndex].vServerGroupAttributes.splice($index + 1, 0, {
          vServerGroupId: undefined,
          vServerGroupName: undefined,
          port: '',
          weight: '',
        });
      };

      this.deleteChild = function($parentIndex: any, $index: any) {
        $scope.command.vServerGroups[$parentIndex].vServerGroupAttributes.splice($index, 1);
      };

      this.delete = function($index: any) {
        $scope.command.vServerGroups.splice($index, 1);
      };
    },
  ]);
