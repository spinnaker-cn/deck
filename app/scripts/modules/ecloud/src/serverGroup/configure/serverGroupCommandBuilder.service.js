'use strict';

const angular = require('angular');
import _ from 'lodash';

import { AccountService, INSTANCE_TYPE_SERVICE, SubnetReader } from '@spinnaker/core';

import { AWSProviderSettings } from '../../aws.settings';
import { AWS_SERVER_GROUP_CONFIGURATION_SERVICE } from 'ecloud/serverGroup/configure/serverGroupConfiguration.service';

module.exports = angular
  .module('spinnaker.ecloud.serverGroupCommandBuilder.service', [
    INSTANCE_TYPE_SERVICE,
    AWS_SERVER_GROUP_CONFIGURATION_SERVICE,
  ])
  .factory('ecloudServerGroupCommandBuilder', [
    '$q',
    'instanceTypeService',
    'ecloudServerGroupConfigurationService',
    function($q, instanceTypeService, ecloudServerGroupConfigurationService) {
      function buildNewServerGroupCommand(application, defaults) {
        defaults = defaults || {};
        var credentialsLoader = AccountService.getCredentialsKeyedByAccount('ecloud');

        var defaultCredentials =
          defaults.account || application.defaultCredentials.ecloud || AWSProviderSettings.defaults.account;
        var defaultRegion =
          defaults.region || application.defaultRegions.ecloud || AWSProviderSettings.defaults.region;
        var defaultSubnet = defaults.subnet || AWSProviderSettings.defaults.subnetType || '';

        var preferredZonesLoader = AccountService.getAvailabilityZonesForAccountAndRegion(
          'ecloud',
          defaultCredentials,
          defaultRegion,
        );

        return $q
          .all({
            preferredZones: preferredZonesLoader,
            credentialsKeyedByAccount: credentialsLoader,
          })
          .then(function(asyncData) {
            var availabilityZones = asyncData.preferredZones;

            var credentials = asyncData.credentialsKeyedByAccount[defaultCredentials];
            var keyPair = credentials ? credentials.defaultKeyPair : null;
            var applicationAwsSettings = _.get(application, 'attributes.providerSettings.ecloud', {});

            var useAmiBlockDeviceMappings = applicationAwsSettings.useAmiBlockDeviceMappings || false;

            var command = {
              application: application.name,
              credentials: defaultCredentials,
              region: defaultRegion,
              strategy: '',
              capacity: {
                min: 1,
                max: 1,
                desired: 1,
              },
              targetHealthyDeployPercentage: 100,
              cooldown: 10,
              enabledMetrics: [],
              enhancedService: {
                monitorService: {
                  enabled: true,
                },
                securityService: {
                  enabled: true,
                },
              },
              ebsOptimized: false,
              selectedProvider: 'ecloud',
              terminationPolicy: [],
              vpcId: null,
              subnetIds: [],
              subnetType: defaultSubnet,
              availabilityZones: availabilityZones,
              keyPair: keyPair,
              suspendedProcesses: [],
              securityGroups: [],
              stack: '',
              detail: '',
              tags: {},
              useAmiBlockDeviceMappings: useAmiBlockDeviceMappings,
              copySourceCustomBlockDeviceMappings: false, // default to using block device mappings from current instance type
              viewState: {
                instanceProfile: 'custom',
                useAllImageSelection: false,
                useSimpleCapacity: false,
                usePreferredZones: true,
                mode: defaults.mode || 'create',
                disableStrategySelection: true,
                dirty: {},
                submitButtonLabel: getSubmitButtonLabel(defaults.mode || 'create'),
              },
              forwardLoadBalancers: [],
              internetAccessible: {
                internetChargeType: 'TRAFFIC_POSTPAID_BY_HOUR',
                internetMaxBandwidthOut: 1,
                publicIpAssigned: true,
              },
              systemDisk: {
                diskType: 'CLOUD_PREMIUM',
                diskSize: 40,
              },
              dataDisks: [],
              weight: 10,
              userData: '',
            };

            if (
              application.attributes &&
              application.attributes.platformHealthOnlyShowOverride &&
              application.attributes.platformHealthOnly
            ) {
              command.interestingHealthProviderNames = ['Ecloud'];
            }

            return command;
          });
      }

      function buildServerGroupCommandFromPipeline(application, originalCluster) {
        var pipelineCluster = _.cloneDeep(originalCluster);
        var region = pipelineCluster.region;
        var instanceTypeCategoryLoader = instanceTypeService.getCategoryForInstanceType(
          'ecloud',
          pipelineCluster.instanceType,
        );
        var commandOptions = { account: pipelineCluster.account, region: region };
        var asyncLoader = $q.all({
          command: buildNewServerGroupCommand(application, commandOptions),
          instanceProfile: instanceTypeCategoryLoader,
        });

        return asyncLoader.then(function(asyncData) {
          var command = asyncData.command;

          var viewState = {
            instanceProfile: asyncData.instanceProfile,
            disableImageSelection: true,
            useSimpleCapacity:
              pipelineCluster.minSize === pipelineCluster.maxSize && pipelineCluster.useSourceCapacity !== true,
            usePreferredZones: true,
            mode: 'editPipeline',
            submitButtonLabel: 'Done',
            templatingEnabled: true,
            existingPipelineCluster: true,
            dirty: {},
          };
          var viewOverrides = {
            region: region,
            credentials: pipelineCluster.account || pipelineCluster.accountName,
            availabilityZones: [],
            viewState: viewState,
            securityGroups: pipelineCluster.securityGroupIds,
            tags:
              pipelineCluster.instanceTags && pipelineCluster.instanceTags.length
                ? pipelineCluster.instanceTags.reduce((pre, current) => {
                    pre[current.key] = current.value;
                    return pre;
                  }, {})
                : {},
          };

          pipelineCluster.strategy = pipelineCluster.strategy || '';

          return angular.extend({}, command, pipelineCluster, viewOverrides);
        });
      }

      // Only used to prepare view requiring template selecting
      function buildNewServerGroupCommandForPipeline() {
        return $q.when({
          viewState: {
            requiresTemplateSelection: true,
          },
        });
      }

      function getSubmitButtonLabel(mode) {
        switch (mode) {
          case 'createPipeline':
            return 'Add';
          case 'editPipeline':
            return 'Done';
          case 'clone':
            return 'Clone';
          default:
            return 'Create';
        }
      }

      function buildUpdateServerGroupCommand(serverGroup) {
        var command = {
          type: 'modifyAsg',
          asgs: [{ asgName: serverGroup.name, region: serverGroup.region }],
          cooldown: serverGroup.asg.defaultCooldown,
          enabledMetrics: _.get(serverGroup, 'asg.enabledMetrics', []).map(m => m.metric),
          terminationPolicy: angular.copy(serverGroup.asg.terminationPolicy),
          credentials: serverGroup.account,
        };
        ecloudServerGroupConfigurationService.configureUpdateCommand(command);
        return command;
      }

      function buildServerGroupCommandFromExisting(application, serverGroup, mode = 'clone') {
        var preferredZonesLoader = AccountService.getPreferredZonesByAccount('ecloud');
        var subnetsLoader = SubnetReader.listSubnets();

        var instanceType = serverGroup.launchConfig ? serverGroup.launchConfig.instanceType : null;
        var instanceTypeCategoryLoader = instanceTypeService.getCategoryForInstanceType('ecloud', instanceType);

        var asyncLoader = $q.all({
          preferredZones: preferredZonesLoader,
          subnets: subnetsLoader,
          instanceProfile: instanceTypeCategoryLoader,
        });
        return asyncLoader.then(function(asyncData) {
          // These processes should never be copied over, as the affect launching instances and enabling traffic
          let enabledProcesses = ['Launch', 'Terminate', 'AddToLoadBalancer'];

          var applicationAwsSettings = _.get(application, 'attributes.providerSettings.ecloud', {});
          var useAmiBlockDeviceMappings = applicationAwsSettings.useAmiBlockDeviceMappings || false;

          const existingTags = {};
          // These tags are applied by Clouddriver (if configured to do so), regardless of what the user might enter
          // Might be worth feature flagging this if it turns out other folks are hard-coding these values
          const reservedTags = [
            'spinnaker:application',
            'spinnaker:stack',
            'spinnaker:details',
            'spinnaker:server-group-name',
          ];
          if (serverGroup.launchConfig.instanceTags) {
            serverGroup.launchConfig.instanceTags
              .filter(t => !reservedTags.includes(t.key))
              .forEach(tag => {
                existingTags[tag.key] = tag.value;
              });
          }

          var command = {
            application: application.name,
            strategy: '',
            // stack: serverGroupName.stack,
            // detail: serverGroupName.detail || serverGroupName.freeFormDetails,
            stack:serverGroup.moniker&&serverGroup.moniker.stack,
            detail:serverGroup.moniker&&serverGroup.moniker.detail,
            credentials: serverGroup.account,
            cooldown: serverGroup.asg.defaultCooldown,
            enabledMetrics: _.get(serverGroup, 'asg.enabledMetrics', []).map(m => m.metric),
            terminationPolicy: serverGroup.asg.terminationPolicySet.length >0 && serverGroup.asg.terminationPolicySet[0],
            loadBalancers: serverGroup.asg.loadBalancerNames,
            loadBalancerId:
              serverGroup.loadBalancers && serverGroup.loadBalancers.length && serverGroup.loadBalancers[0],
            forwardLoadBalancers: serverGroup.forwardLoadBalancers,
            region: serverGroup.region,
            useSourceCapacity: false,
            capacity: {
              min: serverGroup.asg.minSize,
              max: serverGroup.asg.maxSize,
              desired: serverGroup.asg.desiredCapacity,
            },
            targetHealthyDeployPercentage: 100,
            availabilityZones: [],
            selectedProvider: 'ecloud',
            source: {
              account: serverGroup.account,
              region: serverGroup.region,
              serverGroupName: serverGroup.name,
            },
            suspendedProcesses: (serverGroup.asg.suspendedProcesses || [])
              .map(process => process.processName)
              .filter(name => !enabledProcesses.includes(name)),
            tags: Object.assign({}, serverGroup.tags, existingTags),
            targetGroups: serverGroup.targetGroups,
            useAmiBlockDeviceMappings: useAmiBlockDeviceMappings,
            copySourceCustomBlockDeviceMappings: mode === 'clone', // default to using block device mappings if not cloning
            viewState: {
              instanceProfile: asyncData.instanceProfile,
              useAllImageSelection: false,
              useSimpleCapacity: serverGroup.asg.minSize === serverGroup.asg.maxSize,
              usePreferredZones: [],
              mode: mode,
              submitButtonLabel: getSubmitButtonLabel(mode),
              isNew: false,
              dirty: {},
            },
            internet:{
              usePublicIp: serverGroup.launchConfig.internetAccessible.publicIpAssigned,
              chargeType: serverGroup.launchConfig.internetAccessible.internetChargeType,
              bandwidthSize: serverGroup.launchConfig.internetAccessible.internetMaxBandwidthOut,
            },
            // moniker: serverGroup.moniker||{}
          };

          if (
            application.attributes &&
            application.attributes.platformHealthOnlyShowOverride &&
            application.attributes.platformHealthOnly
          ) {
            command.interestingHealthProviderNames = ['Ecloud'];
          }

          if (mode === 'editPipeline') {
            command.useSourceCapacity = true;
            command.viewState.useSimpleCapacity = false;
            command.strategy = 'redblack';
            command.suspendedProcesses = [];
          }

          command.subnetIds = serverGroup.asg && serverGroup.asg.subnetIdSet;
          command.vpcId = serverGroup.asg.vpcId;

          if (serverGroup.launchConfig) {
            angular.extend(command, {
              instanceType: serverGroup.launchConfig.instanceType,
              instanceTypes: serverGroup.launchConfig.instanceTypes,
              keyPair:
                serverGroup.launchConfig.loginSettings.keyIds && serverGroup.launchConfig.loginSettings.keyIds[0],
              associatePublicIpAddress: serverGroup.launchConfig.internetAccessible.publicIpAssigned,
              ramdiskId: serverGroup.launchConfig.ramdiskId,
              enhancedService: {
                  securityService: {
                    enabled: serverGroup.launchConfig.securityReinforce,
                  }
              },
              ebsOptimized: serverGroup.launchConfig.ebsOptimized,
              internetAccessible: serverGroup.launchConfig.internetAccessible,
              systemDisk: serverGroup.launchConfig.systemDisk,
              dataDisks: serverGroup.launchConfig.dataDisks,
              multiRegionCreatePolicy: serverGroup.asg.multiRegionCreatePolicy,
              TerminationPolicies:serverGroup.asg.terminationPolicySet
            });
            if (serverGroup.launchConfig.userData) {
              command.userData = serverGroup.launchConfig.userData;
            }
            command.viewState.imageId = serverGroup.launchConfig.imageId;
          }

          if (mode === 'clone' && serverGroup.image && serverGroup.image.name) {
            command.amiName = serverGroup.image.imageId;
          }

          if (serverGroup.launchConfig && serverGroup.launchConfig.securityGroupIds.length) {
            command.securityGroups = serverGroup.launchConfig.securityGroupIds;
          }



          return command;
        });
      }

      return {
        buildNewServerGroupCommand: buildNewServerGroupCommand,
        buildServerGroupCommandFromExisting: buildServerGroupCommandFromExisting,
        buildNewServerGroupCommandForPipeline: buildNewServerGroupCommandForPipeline,
        buildServerGroupCommandFromPipeline: buildServerGroupCommandFromPipeline,
        buildUpdateServerGroupCommand: buildUpdateServerGroupCommand,
      };
    },
  ]);
