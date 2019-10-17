'use strict';

const angular = require('angular');

import { SERVER_GROUP_WRITER, API, AccountService, TaskMonitor, ModalWizard, FirewallLabels } from '@spinnaker/core';
import { ALICLOUD_SERVERGROUP_CONFIGURATON } from '../serverGroupConfiguration.service';
import { ALICLOUD_SERVERGROUP_TRANSFORMER } from '../../serverGroup.transformer';

export const ALICLOUD_CLONESERVERGROUPCTRL = 'spinnaker.alicloud.cloneServerGroup.controller';
angular
  .module('spinnaker.alicloud.cloneServerGroup.controller', [
    require('@uirouter/angularjs').default,
    ALICLOUD_SERVERGROUP_CONFIGURATON,
    ALICLOUD_SERVERGROUP_TRANSFORMER,
    SERVER_GROUP_WRITER,
  ])
  .directive('alicloudCloneCluster', function() {
    return {
      restrict: 'E',
      templateUrl: require('./serverGroupWizard.html'),
      bindToController: {
      },
      controllerAs: 'alicloudCloneServerGroupCtrl',
      controller: 'alicloudCloneServerGroupCtrl',
    };
  })
  .controller('alicloudCloneServerGroupCtrl', [
    '$scope',
    '$uibModalInstance',
    '$q',
    '$state',
    'serverGroupWriter',
    'alicloudServerGroupConfigurationService',
    'serverGroupCommand',
    'application',
    'title',
    function(
      $scope: any,
      $uibModalInstance: any,
      _$q: any,
      $state: any,
      serverGroupWriter: any,
      alicloudServerGroupConfigurationService: any,
      serverGroupCommand: any,
      application: any,
      title: any,
    ) {

      $scope.pages = {
        templateSelection: require('./templateSelection.html'),
        basicSettings: require('./basicSettings/basicSettings.html'),
        loadBalancers: require('./loadBalancers/loadBalancers.html'),
        networkSettings: require('./networkSettings/networkSettings.html'),
        securityGroups: require('./securityGroup/securityGroups.html'),
        instanceType: require('./instanceType/instanceType.html'),
        zones: require('./capacity/capacity.html'),
        tags: require('./tags/tags.html'),
        advancedSettings: require('./advancedSettings/advancedSettings.html'),
      };
      $scope.isNew = true;
      $scope.firewallsLabel = FirewallLabels.get('Firewalls');
      $scope.title = title;
      $scope.applicationName = application.name;
      $scope.application = application;
      $scope.vnets = [];
      $scope.isvalid = false;
      $scope.regions = [];
      $scope.command = serverGroupCommand;
      $scope.command.application = application.name;
      if ($scope.command.viewState.mode === 'createPipline') {
        $scope.command.viewState = {
          instanceProfile: 'custom',
          allImageSelection: '',
          useAllImageSelection: false,
          useSimpleCapacity: true,
          usePreferredZones: true,
          mode: 'createPipline',
          disableStrategySelection: true,
          loadBalancersConfigured: false,
          networkSettingsConfigured: false,
          securityGroupsConfigured: false,
          submitButtonLabel: 'Done',
        };
        $scope.command.systemDiskCategory = 'cloud_ssd';
        $scope.command.systemDiskSize = 40;
      };
      $scope.command.instanceTags = {};
      $scope.command.backingData = $scope.command.backingData || {};
      $scope.command.backingData.filtered = $scope.command.backingData.filtered || {};
      $scope.command.backingData.filtered.regions = $scope.command.backingData.filtered.regions || [];

      $scope.state = {
        loaded: false,
        // requiresTemplateSelection: !!serverGroupCommand.viewState.requiresTemplateSelection,
      };
      AccountService.getRegionsForAccount(`${$scope.command.credentials}`).then(function(regions: any) {
        const regionsl: any[] = [];
        regions.forEach( ( item: any ) => {
          regionsl.push({ name: item });
        });
        $scope.regions = regionsl;
      });
      API.one('subnets/alicloud').getList().then((vnets: any) => {
        $scope.vnets = vnets;
      });
      function configureCommand() {
        alicloudServerGroupConfigurationService.configureCommand(application, serverGroupCommand).then(function() {
          const mode = serverGroupCommand.viewState.mode;
          if (mode === 'clone' || mode === 'create') {
            serverGroupCommand.viewState.useAllImageSelection = true;
          }
          if (mode === 'createPipline') {
            $scope.command.selectedProvider = 'alicloud';
            API.one('images/find')
              .get({ provider: 'alicloud' }).then(( imageLoader: any ) => {
              $scope.command.imgeId = imageLoader;
            })
          }
          if ($scope.command.viewState.mode !== 'create') {
            if ($scope.command.scalingConfigurations.tags === '') {
              $scope.command.scalingConfigurations.tags = {}
            } else {
              $scope.command.scalingConfigurations.tags = angular.fromJson($scope.command.scalingConfigurations.tags);
            }
            $scope.state.loaded = true;
            initializeWizardState();
            initializeSelectOptions();
            initializeWatches();
          }
          if (mode === 'editPipeline') {
            serverGroupCommand.vSwitchId = serverGroupCommand.scalingGroup.vswitchId;
            $scope.command = serverGroupCommand;
            $scope.command.viewState.loadBalancersConfigured = true;
            $scope.command.viewState.securityGroupsConfigured = true;
            $scope.command.backingData.filtered.regions = $scope.regions
            $scope.vnets.map(( (item: any) => {
              if (item.vswitchId === serverGroupCommand.vSwitchId) {
                serverGroupCommand.masterZoneId = item.zoneId;
                $scope.command = serverGroupCommand;
                $scope.command.vSwitchName = item.vswitchName;
                $scope.command.vpcId = item.vpcId;
                $scope.command.viewState.loadBalancersConfigured = true;
                $scope.command.viewState.sresourceecurityGroupsConfigured = true;
                $scope.command.backingData.filtered.regions = $scope.regions
                $scope.state.loaded = true;
                $scope.state.requiresTemplateSelection = false;
                $scope.state.loaded = true;
                initializeWizardState();
                initializeSelectOptions();
                initializeWatches();
              }
            }))
          } else {
            $scope.state.loaded = true;
            initializeWizardState();
            initializeSelectOptions();
            initializeWatches();
          }
        });
      }
      this.templateSelectionText = {
        copied: [
          'account, region, subnet, cluster name (stack, details)',
          'load balancers',
          FirewallLabels.get('firewalls'),
          'instance type',
          'all fields on the Advanced Settings page',
        ],
        notCopied: [],
        additionalCopyText:
          'If a server group exists in this cluster at the time of deployment, its scaling policies will be copied over to the new server group.',
      };

      function onApplicationRefresh() {
        // If the user has already closed the modal, do not navigate to the new details view
        if ($scope.$$destroyed) {
          return;
        }
        const cloneStage = $scope.taskMonitor.task.execution.stages.find((stage: any) => stage.type === 'cloneServerGroup');
        if (cloneStage && cloneStage.context['deploy.server.groups']) {
          const newServerGroupName = cloneStage.context['deploy.server.groups'][$scope.command.region];
          if (newServerGroupName) {
            const newStateParams = {
              serverGroup: newServerGroupName,
              accountId: $scope.command.credentials,
              region: $scope.command.region,
              provider: 'alicloud',
            };
            let transitionTo = '^.^.^.clusters.serverGroup';
            if ($state.includes('**.clusters.serverGroup')) {
              // clone via details, all view
              transitionTo = '^.serverGroup';
            }
            if ($state.includes('**.clusters.cluster.serverGroup')) {
              // clone or create with details open
              transitionTo = '^.^.serverGroup';
            }
            if ($state.includes('**.clusters')) {
              // create new, no details open
              transitionTo = '.serverGroup';
            }
            $state.go(transitionTo, newStateParams);
          }
        }
      }

      function onTaskComplete() {
        application.serverGroups.refresh();
        application.serverGroups.onNextRefresh($scope, onApplicationRefresh);
      }

      $scope.taskMonitor = new TaskMonitor({
        application: application,
        title: 'Creating your server group',
        modalInstance: $uibModalInstance,
        onTaskComplete: onTaskComplete,
      });

      function initializeWizardState() {
        const mode = serverGroupCommand.viewState.mode;
        if (mode === 'clone' || mode === 'editPipeline') {
          // ModalWizard.markComplete('basic-settings');
          // ModalWizard.markComplete('load-balancers');
          // ModalWizard.markComplete('network-settings');
          // ModalWizard.markComplete('security-groups');
          // ModalWizard.markComplete('instance-type');
          // ModalWizard.markComplete('tags');
        }
      }

      function initializeWatches() {
        $scope.$watch('command.credentials', createResultProcessor($scope.command.credentialsChanged));
        $scope.$watch('command.region', createResultProcessor($scope.command.regionChanged));
      }

      function initializeSelectOptions() {
        processCommandUpdateResult($scope.command.credentialsChanged($scope.command, true));
        processCommandUpdateResult($scope.command.regionChanged($scope.command, true));
      }

      function createResultProcessor(method: any) {
        return function(newValue: any, oldValue: any) {
          if (newValue !== oldValue) {
            processCommandUpdateResult(method($scope.command));
          }
        };
      }

      function processCommandUpdateResult(result: any) {
        if (result.dirty.loadBalancers) {
          ModalWizard.markDirty('load-balancers');
          ModalWizard.markDirty('network-settings');
        }
        if (result.dirty.securityGroups) {
          ModalWizard.markDirty('security-groups');
        }
        if (result.dirty.instanceType) {
          ModalWizard.markDirty('instance-type');
        }
        if (result.dirty.zoneEnabled || result.dirty.zones) {
          ModalWizard.markDirty('zones');
        }
      }

      this.submit = function() {
        $scope.command.serverGroupName = application.applicationName + '-' + $scope.command.stack + '-' + $scope.command.freeFormDetails
        if ($scope.command.scalingConfigurations.spotStrategy !== 'SpotWithPriceLimit') {
          if ($scope.command.scalingConfigurations.spotPriceLimits && $scope.command.scalingConfigurations.spotPriceLimits.length > 0 ) {
            delete $scope.command.scalingConfigurations.spotPriceLimits[0]
            delete $scope.command.scalingConfigurations.spotPriceLimits
          }
        } else {
          $scope.command.scalingConfigurations.spotPriceLimits[0].instanceType = $scope.command.scalingConfigurations.instanceType;
          $scope.command.scalingConfigurations.spotPriceLimits[0].priceLimit = parseFloat($scope.command.scalingConfigurations.spotPriceLimits[0].priceLimit);
        }
        $scope.command.capacity = {};
        $scope.command.capacity = {
          'max': $scope.command.maxSize,
          'min': $scope.command.minSize,
          'desired': $scope.command.minSize,
        }
        if ($scope.command.viewState.mode === 'createPipline') {
          $scope.command.serverGroupName = application.applicationName + '-' + $scope.command.stack + '-' + $scope.command.freeFormDetails;
          $scope.command.application = application.applicationName;
          $scope.command.selectedProvider = 'alicloud';
          $scope.command.viewState = {
            instanceProfile: 'custom',
            allImageSelection: '',
            useAllImageSelection: false,
            useSimpleCapacity: true,
            usePreferredZones: true,
            mode: 'createPipline',
            disableStrategySelection: true,
            loadBalancersConfigured: false,
            networkSettingsConfigured: false,
            securityGroupsConfigured: false,
            submitButtonLabel: 'Done',
          };
          $scope.command.enableInboundNAT = false;
        }

        if ( $scope.command.viewState.mode === 'editPipeline' || $scope.command.viewState.mode === 'editDeploy' || $scope.command.viewState.mode === 'createPipline' ) {
          return $uibModalInstance.close($scope.command);
        }
        $scope.taskMonitor.submit(function() {
          return serverGroupWriter.cloneServerGroup($scope.command, application);
        });
      };

      this.cancel = function() {
        $uibModalInstance.dismiss();
      };

      this.toggleSuspendedProcess = function(process: any) {
        $scope.command.suspendedProcesses = $scope.command.suspendedProcesses || [];
        const processIndex = $scope.command.suspendedProcesses.indexOf(process);
        if (processIndex === -1) {
          $scope.command.suspendedProcesses.push(process);
        } else {
          $scope.command.suspendedProcesses.splice(processIndex, 1);
        }
      };

      this.processIsSuspended = function(process: any) {
        return $scope.command.suspendedProcesses.includes(process);
      };

      if (!$scope.state.requiresTemplateSelection) {
        configureCommand();
      } else {
        $scope.state.loaded = true;
      }

      this.templateSelected = () => {
        // $scope.state.requiresTemplateSelection = false;
        configureCommand();
      };

      $scope.$watch('command.strategy', function(oldVal: any, newVal: any) {
        if (newVal !== oldVal) {
          $scope.isvalid = true
        }
      }, true);

      $scope.$watch('command.useSourceCapacity', function(oldVal: any, newVal: any) {
        if (newVal !== oldVal) {
          $scope.isvalid = true
        }
      }, true);

      this.isValid = function(): boolean {
        if ($scope.command.application === null || $scope.command.freeFormDetails === null || $scope.command.defaultCooldown === null || $scope.command.maxSize == null || $scope.command.minSize === null || $scope.command.stack == null || $scope.command.scalingConfigurations.securityGroupId === null || $scope.command.scalingConfigurations.keyPairName === null || $scope.command.scalingConfigurations.imageId === null || $scope.command.credentials === null ||  $scope.command.scalingConfigurations.instanceType === null ) {
          return true
        } else {
          return false
        }
      };
    },
  ]);
