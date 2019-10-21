'use strict';

const angular = require('angular');
import * as _ from 'lodash';
import { NameUtils } from '@spinnaker/core';
import { ALICLOUD_SERVERGROUP_TRANSFORMER } from '../serverGroup.transformer';
import { ALICLOUD_IMAGE } from '../../image/image.reader';

export const ALICLOUD_SERVERGROUP_COMMSNDBUILDER = 'spinnaker.alicloud.serverGroupCommandBuilder.service';
angular
  .module(ALICLOUD_SERVERGROUP_COMMSNDBUILDER, [
    ALICLOUD_IMAGE,
    ALICLOUD_SERVERGROUP_TRANSFORMER,
  ])
  .factory('alicloudServerGroupCommandBuilder', [
    '$q',
    'alicloudImageReader',
    'alicloudServerGroupTransformer',
    function($q: any, alicloudImageReader: any, alicloudServerGroupTransformer: any) {
      function buildNewServerGroupCommand(application: any, defaults: any) {
        defaults = defaults || {};

        const imageLoader: any[] = alicloudImageReader.findImages({ provider: 'alicloud' });

        const defaultCredentials = defaults.account || application.defaultCredentials.alicloud;
        const defaultRegion = defaults.region || application.defaultRegions.alicloud;

        return $q
          .all({
            images: imageLoader,
          })
          .then(function(backingData: any) {
            const loadbalancers: any[] = [], tags: any = {}, selectedVnetSubnets: any[] = [], zones: any[] = [], instanceType: any  = null, priceLimit: any = null;
            return {
              application: application.name,
              credentials: defaultCredentials,
              region: defaultRegion,
              images: backingData.images,
              loadBalancers: loadbalancers,
              selectedVnetSubnets: selectedVnetSubnets,
              strategy: '',
              // useSourceCapacity: false,
              defaultCooldown: 300,
              zonesEnabled: false,
              zones: zones,
              instanceTags: {},
              systemDiskCategory: 'cloud_ssd',
              systemDiskSize: 40,
              selectedProvider: 'alicloud',
              scalingConfigurations: {
                'spotPriceLimits': [
                  {
                    'priceLimit': priceLimit,
                    'instanceType': instanceType,
                  }
                ],
                'tags': tags,
              },
              viewState: {
                instanceProfile: 'custom',
                allImageSelection: '',
                useAllImageSelection: false,
                useSimpleCapacity: true,
                usePreferredZones: true,
                mode: defaults.mode || 'create',
                disableStrategySelection: true,
                loadBalancersConfigured: false,
                networkSettingsConfigured: false,
                securityGroupsConfigured: false,
              },
              enableInboundNAT: false,
            };
          });
      }

      function buildNewServerGroupCommands(application: any, defaults: any) {
        defaults = defaults || {};
        const imageLoader: any[] = alicloudImageReader.findImages({ provider: 'alicloud' });
        const defaultCredentials = defaults.account || application.defaultCredentials.alicloud;
        const defaultRegion = defaults.region || application.defaultRegions.alicloud;

        return $q
          .all({
            images: imageLoader,
          })
          .then(function(backingData: any) {
            const loadbalancers: any[] = [], selectedVnetSubnets: any[] = [], zones: any[] = [];
            defaults.scalingConfigurations[0].scalingPolicy = defaults.scalingPolicy;
            if ( defaults.scalingConfigurations[0].tags === '') {
              defaults.scalingConfigurations[0].tags = {}
            } else {
              defaults.scalingConfigurations[0].tags = angular.fromJson(defaults.scalingConfigurations[0].tags);
            }

            return {
              application: application.name,
              credentials: defaultCredentials,
              region: defaultRegion,
              useSourceCapacity: defaults.useSourceCapacity || false,
              images: backingData.images,
              loadBalancers: loadbalancers,
              selectedVnetSubnets: selectedVnetSubnets,
              zonesEnabled: false,
              zones: zones,
              instanceTags: {},
              stack: defaults.stack,
              freeFormDetails: defaults.detail,
              defaultCooldown: defaults.defaultCooldown,
              vSwitchId: defaults.vSwitchId,
              vSwitchName: defaults.vSwitchName,
              vpcId: defaults.vpcId,
              loadBalancerIds: defaults.loadBalancerIds,
              maxSize: defaults.maxSize,
              minSize: defaults.minSize,
              strategy: defaults.strategy || '',
              masterZoneId: defaults.masterZoneId,
              systemDiskCategory: defaults.scalingConfigurations[0].systemDiskCategory,
              systemDiskSize: defaults.scalingConfigurations[0].systemDiskSize,
              selectedProvider: 'alicloud',
              scalingConfigurations: defaults.scalingConfigurations[0],
              viewState: {
                instanceProfile: 'custom',
                allImageSelection: '',
                useAllImageSelection: false,
                useSimpleCapacity: true,
                usePreferredZones: true,
                mode: defaults.mode || 'editDeploy',
                submitButtonLabel: 'Done',
                disableStrategySelection: true,
                loadBalancersConfigured: false,
                networkSettingsConfigured: false,
                securityGroupsConfigured: false,
              },
              enableInboundNAT: false,
            };
          });
      }

      // Only used to prepare view requiring template selecting
      function buildNewServerGroupCommandForPipeline() {
        const instanceType: any  = null, priceLimit: any = null;
        return $q.when({
          viewState: {
            // requiresTemplateSelection: true,
            mode: 'createPipline',
          },
          scalingConfigurations: {
            'spotPriceLimits': [
              {
                'priceLimit': priceLimit,
                'instanceType': instanceType,
              }
            ],
          },
        });
      }

      function buildServerGroupCommandFromExisting(application: any, serverGroup: any, mode: any) {
        mode = mode || 'clone';
        serverGroup.result.scalingConfiguration.multiAZPolicy = serverGroup.result.scalingGroup.multiAZPolicy;
        serverGroup.result.scalingConfiguration.scalingPolicy = serverGroup.result.scalingGroup.scalingPolicy;
        if (serverGroup.result.scalingConfiguration.tags === '' ||  serverGroup.result.scalingConfiguration.tags === {} ) {
          serverGroup.result.scalingConfiguration.tags = {}
        } else {
          serverGroup.result.scalingConfiguration.tags = angular.fromJson(serverGroup.result.scalingConfiguration.tags);
        }
        const serverGroupName = NameUtils.parseServerGroupName(serverGroup.name);
        const command: any = {
          application: application.name,
          strategy: '',
          stack: serverGroupName.stack,
          freeFormDetails: serverGroupName.freeFormDetails,
          maxSize: serverGroup.capacity.max,
          minSize: serverGroup.capacity.min,
          defaultCooldown: serverGroup.result.scalingGroup.defaultCooldown,
          credentials: serverGroup.account,
          loadBalancers: serverGroup.loadBalancers,
          selectedSubnets: serverGroup.selectedVnetSubnets,
          vSwitchId: serverGroup.result.scalingGroup.vswitchId,
          vpcId: serverGroup.result.scalingGroup.vpcId,
          vSwitchName: serverGroup.result.scalingGroup.vSwitchName,
          systemDiskCategory: serverGroup.result.scalingConfiguration.systemDiskCategory,
          systemDiskSize: serverGroup.result.scalingConfiguration.systemDiskSize,
          securityGroups: serverGroup.securityGroups,
          loadBalancerName: serverGroup.appGatewayName,
          securityGroupName: serverGroup.securityGroupName,
          region: serverGroup.region,
          vnet: serverGroup.vnet,
          vnetResourceGroup: serverGroup.vnetResourceGroup,
          subnet: serverGroup.subnet,
          sku: serverGroup.sku,
          masterZoneId: null,
          capacity: {
            min: serverGroup.capacity.min,
            max: serverGroup.capacity.max,
            desired: serverGroup.capacity.desired,
          },
          tags: {},
          instanceTags: serverGroup.result.scalingConfiguration.tags,
          instanceType: serverGroup.result.scalingConfiguration.instanceType,
          selectedProvider: 'alicloud',
          source: {
            account: serverGroup.account,
            region: serverGroup.region,
            serverGroupName: serverGroup.name,
            asgName: serverGroup.name,
          },
          scalingConfigurations: serverGroup.result.scalingConfiguration,
          scalingGroup: serverGroup.result.scalingGroup,
          backingData: {
            filtered: {
              regions: [],
            },
          },
          viewState: {
            allImageSelection: null,
            useAllImageSelection: false,
            useSimpleCapacity: true,
            usePreferredZones: false,
            listImplicitSecurityGroups: false,
            mode: mode,
            disableStrategySelection: true,
          },
          enableInboundNAT: serverGroup.enableInboundNAT,
        };
        if (typeof serverGroup.customScriptsSettings !== 'undefined') {
          command.customScriptsSettings = {};
          command.customScriptsSettings.commandToExecute = serverGroup.customScriptsSettings.commandToExecute;
          if (
            typeof serverGroup.customScriptsSettings.fileUris !== 'undefined' &&
            serverGroup.customScriptsSettings.fileUris !== ''
          ) {
            alicloudServerGroupTransformer.parseCustomScriptsSettings(serverGroup, command);
          }
        }

        return $q.when(command);
      }

      function buildServerGroupCommandFromPipeline(application: any, originalCluster: any) {
        const asyncLoader: any = $q.all({
          command: buildNewServerGroupCommands(application, originalCluster),
        });
        return asyncLoader.then(function(asyncData: any) {
          const command = asyncData.command;
          return command;
        });
      }

      return {
        buildNewServerGroupCommand: buildNewServerGroupCommand,
        buildNewServerGroupCommandForPipeline: buildNewServerGroupCommandForPipeline,
        buildServerGroupCommandFromExisting: buildServerGroupCommandFromExisting,
        buildServerGroupCommandFromPipeline: buildServerGroupCommandFromPipeline,
      };
    },
  ]);
