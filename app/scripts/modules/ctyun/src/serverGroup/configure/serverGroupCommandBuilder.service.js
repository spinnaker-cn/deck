'use strict';

const angular = require('angular');
import _ from 'lodash';

import { AccountService, INSTANCE_TYPE_SERVICE, NameUtils, SubnetReader } from '@spinnaker/core';

import { AWSProviderSettings } from '../../aws.settings';
import { AWS_SERVER_GROUP_CONFIGURATION_SERVICE } from 'ctyun/serverGroup/configure/serverGroupConfiguration.service';
import { zoneReader } from 'ctyun/zone';

module.exports = angular
  .module('spinnaker.ctyun.serverGroupCommandBuilder.service', [
    INSTANCE_TYPE_SERVICE,
    AWS_SERVER_GROUP_CONFIGURATION_SERVICE,
  ])
  .factory('ctyunServerGroupCommandBuilder', [
    '$q',
    'instanceTypeService',
    'ctyunServerGroupConfigurationService',
    function($q, instanceTypeService, ctyunServerGroupConfigurationService) {
      function buildNewServerGroupCommand(application, defaults) {
        defaults = defaults || {};
        var credentialsLoader = AccountService.getCredentialsKeyedByAccount('ctyun');

        var defaultCredentials =
          defaults.account || application.defaultCredentials.ctyun || AWSProviderSettings.defaults.account;
        var defaultRegion = defaults.region || application.defaultRegions.ctyun || AWSProviderSettings.defaults.region;
        var defaultSubnet = defaults.subnet || AWSProviderSettings.defaults.subnetType || '';

        var preferredZonesLoader = AccountService.getAvailabilityZonesForAccountAndRegion(
          'ctyun',
          defaultCredentials,
          defaultRegion,
        );

        var zonesLoader = [];
        if (defaultCredentials && defaultRegion) {
          zonesLoader = zoneReader.listZones(defaultCredentials, defaultRegion);
        }

        return $q
          .all({
            preferredZones: preferredZonesLoader,
            credentialsKeyedByAccount: credentialsLoader,
            zones: zonesLoader,
          })
          .then(function(asyncData) {
            var availabilityZones = asyncData.preferredZones;
            var credentials = asyncData.credentialsKeyedByAccount[defaultCredentials];
            var keyPair = credentials ? credentials.defaultKeyPair : null;
            var applicationAwsSettings = _.get(application, 'attributes.providerSettings.ctyun', {});

            var useAmiBlockDeviceMappings = applicationAwsSettings.useAmiBlockDeviceMappings || false;

            var command = {
              optionZone: asyncData.zones,
              selectedProvider: 'ctyun',
              viewState: {
                disableImageSelection: false,
                imageSourceText: false,
                instanceProfile: 'custom',
                useAllImageSelection: false,
                useSimpleCapacity: true,
                usePreferredZones: true,
                mode: defaults.mode || 'create',
                disableStrategySelection: true,
                dirty: {},
                submitButtonLabel: getSubmitButtonLabel(defaults.mode || 'create'),
              },
              application: application.name,
              // basic
              credentials: defaultCredentials, // accountName
              region: defaultRegion, // regionID
              vpcId: null,
              recoveryMode: 1,
              stack: '',
              detail: '',
              healthMode: '1',
              healthPeriod: '300',
              // moveOutStrategy: '1',
              mazInfoList: [
                {
                  azName: '',
                  masterId: '',
                  optionId: [],
                },
              ],
              projectID: '',
              ruleList: [],
              configID: '',
              lbList: [],
              subnetIDList: [],

              subnetIds: [],
              subnetType: defaultSubnet,
              // firewall
              securityGroups: [], // securityGroupIds

              strategy: '',
              capacity: {
                min: 1,
                max: 1,
                desired: 1,
              },
              targetHealthyDeployPercentage: 100,
              cooldown: 300,
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

              terminationPolicies: [1],

              availabilityZones: availabilityZones,
              keyPair: keyPair,
              suspendedProcesses: [],

              tags: {},
              useAmiBlockDeviceMappings: useAmiBlockDeviceMappings,
              copySourceCustomBlockDeviceMappings: false, // default to using block device mappings from current instance type

              forwardLoadBalancers: [],
              internetAccessible: {
                internetChargeType: 2,
                internetMaxBandwidthOut: 1,
                publicIpAssigned: true,
              },
              systemDisk: {
                diskType: 'SATA',
                diskSize: 50,
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
              command.interestingHealthProviderNames = ['ctyun'];
            }

            return command;
          });
      }

      function buildServerGroupCommandFromPipeline(application, originalCluster) {
        var pipelineCluster = _.cloneDeep(originalCluster);
        var region = pipelineCluster.region;
        var instanceTypeCategoryLoader = instanceTypeService.getCategoryForInstanceType(
          'ctyun',
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
          terminationPolicies: angular.copy(serverGroup.asg.terminationPolicies),
          credentials: serverGroup.account,
        };
        ctyunServerGroupConfigurationService.configureUpdateCommand(command);
        return command;
      }

      function buildServerGroupCommandFromExisting(application, serverGroup, mode = 'clone') {
        var preferredZonesLoader = AccountService.getPreferredZonesByAccount('ctyun');
        var subnetsLoader = SubnetReader.listSubnets();

        var serverGroupName = NameUtils.parseServerGroupName(serverGroup.asg.autoScalingGroupName);

        var instanceType = serverGroup.launchConfig ? serverGroup.launchConfig.instanceType : null;
        var instanceTypeCategoryLoader = instanceTypeService.getCategoryForInstanceType('ctyun', instanceType);

        var asyncLoader = $q.all({
          preferredZones: preferredZonesLoader,
          subnets: subnetsLoader,
          instanceProfile: instanceTypeCategoryLoader,
        });

        return asyncLoader.then(function(asyncData) {
          // These processes should never be copied over, as the affect launching instances and enabling traffic
          let enabledProcesses = ['Launch', 'Terminate', 'AddToLoadBalancer'];

          var applicationAwsSettings = _.get(application, 'attributes.providerSettings.ctyun', {});
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
          if (serverGroup.launchConfig.tags) {
            serverGroup.launchConfig.tags
              // .filter(t => !reservedTags.includes(t.key))
              .forEach(tag => {
                existingTags[tag.key] = tag.value;
              });
          }
          let forwardLoadBalancers = [];
          if (serverGroup.loadBlanders && serverGroup.loadBlanders.length > 0) {
            serverGroup.loadBlanders.forEach(lb => {
              lb.loadBalancerId = lb.lbID;
              lb.listenerId = lb.listener.listenerId || '';
              let rules = lb.listener.rule ? lb.listener.rule : '';
              lb.locationId = rules ? rules.locationId : '';
              lb.targetAttributes = [
                {
                  port: lb.port,
                  weight: lb.weight,
                },
              ];
              forwardLoadBalancers.push(lb);
            });
          }
          var command = {
            application: application.name,
            strategy: '',
            stack: serverGroup.moniker.stack,
            detail: serverGroup.moniker.detail || serverGroupName.freeFormDetails,
            credentials: serverGroup.account,
            cooldown: serverGroup.cooldown || 300,
            enabledMetrics: _.get(serverGroup, 'asg.enabledMetrics', []).map(m => m.metric),
            terminationPolicies: [serverGroup.asg.moveOutStrategy],
            loadBalancers: serverGroup.asg.loadBalancerNames,
            loadBalancerId:
              serverGroup.loadBalancers && serverGroup.loadBalancers.length && serverGroup.loadBalancers[0],
            forwardLoadBalancers: forwardLoadBalancers,
            region: serverGroup.region,
            useSourceCapacity: false,
            capacity: {
              min: serverGroup.asg.minCount,
              max: serverGroup.asg.maxCount,
              desired: serverGroup.asg.instanceCount,
            },
            targetHealthyDeployPercentage: 100,
            availabilityZones: [],
            selectedProvider: 'ctyun',
            source: {
              account: serverGroup.account,
              region: serverGroup.region,
              serverGroupName: serverGroup.asg.name,
            },
            recoveryMode: serverGroup.asg.recoveryMode,
            healthMode: serverGroup.asg.healthMode,
            healthPeriod: '' + serverGroup.asg.healthPeriod,
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
              useSimpleCapacity: serverGroup.asg.minCount === serverGroup.asg.maxCount,
              usePreferredZones: [],
              mode: mode,
              submitButtonLabel: getSubmitButtonLabel(mode),
              isNew: false,
              dirty: {},
            },
          };

          if (
            application.attributes &&
            application.attributes.platformHealthOnlyShowOverride &&
            application.attributes.platformHealthOnly
          ) {
            command.interestingHealthProviderNames = ['ctyun'];
          }

          if (mode === 'editPipeline') {
            command.useSourceCapacity = true;
            command.viewState.useSimpleCapacity = false;
            command.strategy = 'redblack';
            command.suspendedProcesses = [];
          }

          command.subnetIds = serverGroup.asg && serverGroup.asg.subnetIDList;
          command.vpcId = serverGroup.asg.vpcID;
          command.mazInfoList = serverGroup.mazInfoList;

          if (serverGroup.launchConfig) {
            angular.extend(command, {
              instanceType: serverGroup.launchConfig.specName,
              instanceTypes: serverGroup.launchConfig.specName ? serverGroup.launchConfig.specName.split(',') : [],
              keyPair: '', //serverGroup.launchConfig.loginSettings.keyIds && serverGroup.launchConfig.loginSettings.keyIds[0],
              associatePublicIpAddress: serverGroup.launchConfig.useFloatings,
              ramdiskId: '', // serverGroup.launchConfig.ramdiskId,
              enhancedService: { enabled: true, monitorService: true, securityService: true }, // serverGroup.launchConfig.enhancedService,
              ebsOptimized: '', // serverGroup.launchConfig.ebsOptimized,
              internetAccessible: {
                publicIpAssigned: serverGroup.launchConfig.useFloatings == 1 ? false : true,
                internetChargeType: serverGroup.launchConfig.billingMode || 1,
                internetMaxBandwidthOut: serverGroup.launchConfig.bandwidth || '',
              },
              systemDisk: serverGroup.launchConfig.systemDisk,
              dataDisks: serverGroup.launchConfig.dataDisks,
            });
            if (serverGroup.launchConfig.userData) {
              command.userData = serverGroup.launchConfig.userData;
            }
            command.viewState.imageId = serverGroup.launchConfig.imageID;
          }

          if (mode === 'clone' && serverGroup.launchConfig.imageID && serverGroup.launchConfig.imageName) {
            command.amiName = serverGroup.launchConfig.imageName;
            command.imageId = serverGroup.launchConfig.imageID;
          }

          if (serverGroup.launchConfig && serverGroup.launchConfig.securityGroupList.length) {
            command.securityGroups = serverGroup.launchConfig.securityGroupList;
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
