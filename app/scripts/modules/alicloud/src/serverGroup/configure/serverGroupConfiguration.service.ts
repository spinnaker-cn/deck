'use strict';

const angular = require('angular');
import * as _ from 'lodash';

import {
  AccountService,
  CACHE_INITIALIZER_SERVICE,
  LOAD_BALANCER_READ_SERVICE,
  SECURITY_GROUP_READER,
} from '@spinnaker/core';
import { ALICLOUD_INSTANCE_SERVICE } from '../../instance/alicloudInstanceType.service';
import { ALICLOUD_IMAGE } from '../../image/image.reader';

export const ALICLOUD_SERVERGROUP_CONFIGURATON = 'spinnaker.alicloud.serverGroup.configure.service';
angular
  .module(ALICLOUD_SERVERGROUP_CONFIGURATON, [
    ALICLOUD_IMAGE,
    LOAD_BALANCER_READ_SERVICE,
    SECURITY_GROUP_READER,
    CACHE_INITIALIZER_SERVICE,
    ALICLOUD_INSTANCE_SERVICE,
  ])
  .factory('alicloudServerGroupConfigurationService', [
    '$q',
    'alicloudImageReader',
    'securityGroupReader',
    'cacheInitializer',
    'loadBalancerReader',
    'alicloudInstanceTypeService',
    function(
      $q: any,
      _alicloudImageReader: any,
      securityGroupReader: any,
      cacheInitializer: any,
      loadBalancerReader: any,
      alicloudInstanceTypeService: any,
    ) {
      const dataDiskTypes = ['Standard_LRS', 'StandardSSD_LRS', 'Premium_LRS'];
      const dataDiskCachingTypes = ['None', 'ReadOnly', 'ReadWrite'];
      const healthCheckTypes = ['EC2', 'ELB'],
        terminationPolicies = [
          'OldestInstance',
          'NewestInstance',
          'OldestLaunchConfiguration',
          'ClosestToNextInstanceHour',
          'Default',
        ];

      function configureUpdateCommand(command: any) {
        command.backingData = {
          healthCheckTypes: angular.copy(healthCheckTypes),
          terminationPolicies: angular.copy(terminationPolicies),
        };
      }

      function configureCommand( application: any, command: any) {
        return $q
          .all({
            credentialsKeyedByAccount: AccountService.getCredentialsKeyedByAccount('alicloud'),
            securityGroups: securityGroupReader.loadSecurityGroups(),
            loadBalancers: loadBalancerReader.loadLoadBalancers(application.name),
            dataDiskTypes: $q.when(angular.copy(dataDiskTypes)),
            dataDiskCachingTypes: $q.when(angular.copy(dataDiskCachingTypes)),
          })
          .then(function(backingData: any) {
            backingData.accounts = _.keys(backingData.credentialsKeyedByAccount);
            backingData.filtered = {};
            command.backingData = backingData;
            attachEventHandlers(command);
          });
      }

      function configureInstanceTypes(command: any) {
        const result: any = {
          dirty: {},
        };
        if (command.region) {
          const results = [result.dirty];

          angular.extend(...results);
        } else {
          command.backingData.filtered.instanceTypes = [];
        }
        return result;
      }

      function configureImages(command: any) {
        const result: any = {
          dirty: {},
        };
        let regionalImages: any = null;
        if (command.viewState.disableImageSelection) {
          return result;
        }
        if (command.region) {
          regionalImages = command.backingData.packageImages
          .filter(function(image: any) {
            return image.amis && image.amis[command.region];
          })
          .map(function(image: any) {
            return {
              imageName: image.imageName,
              ami: image.amis ? image.amis[command.region][0] : null,
            };
          });
          if (command.amiName && !regionalImages.some(function(image: any) {
              return image.imageName === command.amiName;
            })
          ) {
            result.dirty.amiName = true;
            command.amiName = null;
          }
        } else {
          command.amiName = null;
        }
        command.backingData.filtered.images = regionalImages;
        return result;
      };

      function configureZones(command: any) {
        const result: any = { dirty: {} };
        const filteredData = command.backingData.filtered;
        if (!command.region) {
          return result;
        }
        let { regionsSupportZones, availabilityZones } = command.backingData.credentialsKeyedByAccount[
          command.credentials
        ];
        regionsSupportZones = regionsSupportZones || [];
        availabilityZones = availabilityZones || [];
        filteredData.zones = regionsSupportZones.includes(command.region) ? availabilityZones : [];

        return result;
      }

      function getRegionalSecurityGroups(command: any) {
        const newSecurityGroups: any = command.backingData.securityGroups[command.credentials] || {
          alicloud: {},
        };
        return _.chain(newSecurityGroups[command.region])
          .sortBy('name')
          .value();
      }

      function configureSecurityGroupOptions(command: any) {
        const result: any = {
          dirty: {},
        };
        let currentOptions;
        if (command.backingData.filtered.securityGroups) {
          currentOptions = command.backingData.filtered.securityGroups;
        }
        const newRegionalSecurityGroups = getRegionalSecurityGroups(command);
        if (command.selectedSecurityGroup) {
          command.selectedSecurityGroup = null;
          result.dirty.securityGroups = true;
        }
        if (currentOptions !== newRegionalSecurityGroups) {
          command.backingData.filtered.securityGroups = newRegionalSecurityGroups;
          result.dirty.securityGroups = true;
        }

        if (command.backingData.filtered.securityGroups === []) {
          command.viewState.securityGroupsConfigured = false;
        } else {
          command.viewState.securityGroupsConfigured = true;
        }

        return result;
      }

      function refreshSecurityGroups(command: any, skipCommandReconfiguration: any) {
        return cacheInitializer.refreshCache('securityGroups').then(function() {
          return securityGroupReader.getAllSecurityGroups().then(function(securityGroups: any) {
            command.backingData.securityGroups = securityGroups;
            if (!skipCommandReconfiguration) {
              configureSecurityGroupOptions(command);
            }
          });
        });
      }

      function getLoadBalancerNames(loadBalancers: any) {
        return _.chain(loadBalancers)
          .map('name')
          .uniq()
          .value()
          .sort();
      }

      function configureLoadBalancerOptions(command: any) {
        const result: any = {
          dirty: {},
        };
        const current = command.loadBalancers;
        const newLoadBalancers = getLoadBalancerNames(command.backingData.loadBalancers);

        if (current && command.loadBalancers) {
          const matched = _.intersection(newLoadBalancers, command.loadBalancers);
          const removed = _.xor(matched, current);
          command.loadBalancers = matched;
          if (removed.length) {
            result.dirty.loadBalancers = removed;
          }
        }
        command.backingData.filtered.loadBalancers = newLoadBalancers;
        return result;
      }

      function refreshLoadBalancers(command: any, skipCommandReconfiguration: any) {
        return loadBalancerReader.listLoadBalancers('alicloud').then(function(loadBalancers: any) {
          command.backingData.loadBalancers = loadBalancers;
          if (!skipCommandReconfiguration) {
            configureLoadBalancerOptions(command);
          }
        });
      }

      function configureLoadBalancers(command: any) {
        const result: any = {
          dirty: {},
        };
        const temp = command.backingData.loadBalancers;
        const filterlist = _.filter(temp, function(lb: any) {
          return lb.account === command.credentials && lb.region === command.region;
        });

        command.loadBalancers = getLoadBalancerNames(filterlist);
        command.viewState.loadBalancersConfigured = true;

        return result;
      }

      function attachEventHandlers(cmd: any) {
        cmd.regionChanged = function regionChanged(command: any, isInit: any = false) {
          const result: any = {
            dirty: {},
          };
          if (command.region && command.credentials) {
            angular.extend(result.dirty, configureLoadBalancers(command).dirty);
            angular.extend(result.dirty, configureSecurityGroupOptions(command).dirty);
            angular.extend(result.dirty, configureInstanceTypes(command).dirty);
            angular.extend(result.dirty, configureZones(command).dirty);
          }
          // reset previous set values
          if (!isInit) {
            command.loadBalancerName = null;
            command.vnet = null;
            command.vnetResourceGroup = null;
            command.subnet = null;
            command.selectedSubnet = null;
            command.selectedVnet = null;
            command.selectedVnetSubnets = [];
            command.viewState.networkSettingsConfigured = false;
            command.selectedSecurityGroup = null;
            command.securityGroupName = null;
            command.zonesEnabled = false;
            command.zones = [];
          }

          return result;
        };

        cmd.credentialsChanged = function credentialsChanged(command: any, isInit: any) {
          const result: any = {
            dirty: {},
          };
          const backingData = command.backingData;
          if (command.credentials) {
            const regionsForAccount: any = backingData.credentialsKeyedByAccount[command.credentials] || {
              regions: [],
              defaultKeyPair: null,
            };
            const nregion: any[] = [];
            regionsForAccount.regions.forEach((item: any) => {
              nregion.push({ 'name': item })
            });
            backingData.filtered.regions = nregion
            if (
              !_.chain(backingData.filtered.regions)
                .some({
                  name: command.region,
                })
                .value()
            ) {
              command.region = null;
              result.dirty.region = true;
            } else {
              angular.extend(result.dirty, command.regionChanged(command, isInit).dirty);
            }
            if (command.region) {
              angular.extend(result.dirty, configureLoadBalancers(command).dirty);
            }
            angular.extend(result.dirty, configureInstanceTypes(command).dirty);
          } else {
            command.region = null;
          }
          return result;
        };
      }

      function refreshInstanceTypes(command: any) {
        return cacheInitializer.refreshCache('instanceTypes').then(function() {
          return alicloudInstanceTypeService.getAllTypesByRegion().then(function(instanceTypes: any) {
            command.backingData.instanceTypes = instanceTypes;
            configureInstanceTypes(command);
          });
        });
      }

      return {
        configureUpdateCommand: configureUpdateCommand,
        configureCommand: configureCommand,
        configureImages: configureImages,
        configureSecurityGroupOptions: configureSecurityGroupOptions,
        configureLoadBalancerOptions: configureLoadBalancerOptions,
        refreshLoadBalancers: refreshLoadBalancers,
        refreshSecurityGroups: refreshSecurityGroups,
        getRegionalSecurityGroups: getRegionalSecurityGroups,
        refreshInstanceTypes: refreshInstanceTypes,
        configureZones: configureZones,
      };
    },
  ]);
