import { module, IPromise } from 'angular';
import { $q } from 'ngimport';
import { chain, clone, cloneDeep, extend, find, has, intersection, keys, map, some, xor } from 'lodash';

import {
  AccountService,
  Application,
  CACHE_INITIALIZER_SERVICE,
  CacheInitializerService,
  IAccountDetails,
  IDeploymentStrategy,
  IRegion,
  ISecurityGroup,
  IServerGroupCommand,
  IServerGroupCommandBackingData,
  IServerGroupCommandBackingDataFiltered,
  IServerGroupCommandDirty,
  IServerGroupCommandResult,
  LOAD_BALANCER_READ_SERVICE,
  LoadBalancerReader,
  NameUtils,
  SECURITY_GROUP_READER,
  SecurityGroupReader,
  SERVER_GROUP_COMMAND_REGISTRY_PROVIDER,
  ServerGroupCommandRegistry,
  SubnetReader,
  IServerGroupCommandViewState,
} from '@spinnaker/core';

import { IKeyPair, IHeCloudLoadBalancerSourceData, IScalingProcess, IALBListener, IALBPool } from 'hecloud/domain';
import { VpcReader, IHeCloudVpc } from 'hecloud/vpc';
import { KeyPairsReader } from 'hecloud/keyPairs';
import { AutoScalingProcessService } from '../details/scalingProcesses/AutoScalingProcessService';

export type IBlockDeviceMappingSource = 'source' | 'ami' | 'default';

export interface IHeCloudServerGroupCommandDirty extends IServerGroupCommandDirty {
  targetGroups?: string[];
}

export interface IHeCloudServerGroupCommandResult extends IServerGroupCommandResult {
  dirty: IHeCloudServerGroupCommandDirty;
}
export interface IHeCloudLbListenerMap {
  [key: string]: IALBListener[];
}
export interface IHeCloudLbPoolMap {
  [key: string]: IALBPool[];
}
export interface IHeCloudServerGroupCommandBackingDataFiltered extends IServerGroupCommandBackingDataFiltered {
  keyPairs: IKeyPair[];
  targetGroups: string[];
  vpcList: IHeCloudVpc[];
  lbList: IHeCloudLoadBalancerSourceData[];
  listenerList: IALBListener[];
  lbListenerMap: IHeCloudLbListenerMap;
  lbpoolMap: IHeCloudLbPoolMap;
}

export interface IHeCloudServerGroupCommandBackingData extends IServerGroupCommandBackingData {
  appLoadBalancers: IHeCloudLoadBalancerSourceData[];
  filtered: IHeCloudServerGroupCommandBackingDataFiltered;
  keyPairs: IKeyPair[];
  targetGroups: string[];
  scalingProcesses: IScalingProcess[];
  diskTypes: string[];
  vpcList: IHeCloudVpc[];
  listenerList: IALBListener[];
}

export interface IHeCloudServerGroupCommandViewState extends IServerGroupCommandViewState {
  dirty: IHeCloudServerGroupCommandDirty;
}
export interface IHeCloudDisk {
  diskType: string;
  diskSize: number;
  snapshotId?: string;
  index?: number;
}
export interface IHeCloudForwardLoadBalancerTargetAttribute {
  port: number;
  weight: number;
}
export interface IHeCloudForwardLoadBalancer {
  loadBalancerId: string;
  listenerId: string;
  poolId?: string;
  targetAttributes: IHeCloudForwardLoadBalancerTargetAttribute[];
}
export interface IHeCloudInternetAccessible {
  internetChargeType: string;
  internetMaxBandwidthOut: number;
  publicIpAssigned: boolean;
}
export interface IHeCloudServerGroupCommand extends IServerGroupCommand {
  detail: string;
  subnetIds: string[];
  internetAccessible: IHeCloudInternetAccessible;
  systemDisk: IHeCloudDisk;
  dataDisks: IHeCloudDisk[];
  osPlatform: string;
  forwardLoadBalancers: IHeCloudForwardLoadBalancer[];
  loadBalancerId: string;
  listenerId: string;
  poolId: string;
  port: number;
  weight: number;
  associatePublicIpAddress: boolean;
  backingData: IHeCloudServerGroupCommandBackingData;
  copySourceCustomBlockDeviceMappings: boolean;
  ebsOptimized: boolean;
  healthCheckGracePeriod: number;
  keyPair: string;
  legacyUdf?: boolean;
  useAmiBlockDeviceMappings: boolean;
  targetGroups: string[];
  spelTargetGroups: string[];
  spelLoadBalancers: string[];
  viewState: IHeCloudServerGroupCommandViewState;

  getBlockDeviceMappingsSource: (command: IServerGroupCommand) => IBlockDeviceMappingSource;
  selectBlockDeviceMappingsSource: (command: IServerGroupCommand, selection: string) => void;
  usePreferredZonesChanged: (command: IServerGroupCommand) => IHeCloudServerGroupCommandResult;
  clusterChanged: (command: IServerGroupCommand) => void;
  regionIsDeprecated: (command: IServerGroupCommand) => boolean;
  vpcIdChanged: (command: IServerGroupCommand) => IServerGroupCommandResult;
  loadBalancerChanged: (command: IHeCloudServerGroupCommand) => IServerGroupCommandResult;
}

export class HeServerGroupConfigurationService {
  private enabledMetrics = [
    'GroupMinSize',
    'GroupMaxSize',
    'GroupDesiredCapacity',
    'GroupInServiceInstances',
    'GroupPendingInstances',
    'GroupStandbyInstances',
    'GroupTerminatingInstances',
    'GroupTotalInstances',
  ];
  private terminationPolicies = ['OLD_CONFIG_OLD_INSTANCE', 'OLD_CONFIG_NEW_INSTANCE', 'OLD_INSTANCE', 'NEW_INSTANCE'];
  private diskTypes = ['SAS', 'SSD', 'GPSSD'];
  public static $inject = [
    'securityGroupReader',
    'hecloudInstanceTypeService',
    'cacheInitializer',
    'loadBalancerReader',
    'serverGroupCommandRegistry',
  ];
  constructor(
    private securityGroupReader: SecurityGroupReader,
    private hecloudInstanceTypeService: any,
    private cacheInitializer: CacheInitializerService,
    private loadBalancerReader: LoadBalancerReader,
    private serverGroupCommandRegistry: ServerGroupCommandRegistry,
  ) {}

  public configureUpdateCommand(command: IHeCloudServerGroupCommand): void {
    command.backingData = {
      enabledMetrics: clone(this.enabledMetrics),
      terminationPolicies: clone(this.terminationPolicies),
      diskTypes: clone(this.diskTypes),
    } as IHeCloudServerGroupCommandBackingData;
  }

  public configureCommand(application: Application, cmd: IHeCloudServerGroupCommand): IPromise<void> {
    this.applyOverrides('beforeConfiguration', cmd);
    // TODO: Instead of attaching these to the command itself, they could be static methods
    cmd.toggleSuspendedProcess = (command: IHeCloudServerGroupCommand, process: string): void => {
      command.suspendedProcesses = command.suspendedProcesses || [];
      const processIndex = command.suspendedProcesses.indexOf(process);
      if (processIndex === -1) {
        command.suspendedProcesses = command.suspendedProcesses.concat(process);
      } else {
        command.suspendedProcesses = command.suspendedProcesses.filter(p => p !== process);
      }
    };

    cmd.processIsSuspended = (command: IHeCloudServerGroupCommand, process: string): boolean =>
      command.suspendedProcesses.includes(process);

    cmd.onStrategyChange = (command: IHeCloudServerGroupCommand, strategy: IDeploymentStrategy): void => {
      // Any strategy other than None or Custom should force traffic to be enabled
      if (strategy.key !== '' && strategy.key !== 'custom') {
        command.suspendedProcesses = (command.suspendedProcesses || []).filter(p => p !== 'AddToLoadBalancer');
      }
    };

    cmd.getBlockDeviceMappingsSource = (command: IHeCloudServerGroupCommand): IBlockDeviceMappingSource => {
      if (command.copySourceCustomBlockDeviceMappings) {
        return 'source';
      } else if (command.useAmiBlockDeviceMappings) {
        return 'ami';
      }
      return 'default';
    };

    cmd.selectBlockDeviceMappingsSource = (command: IHeCloudServerGroupCommand, selection: string): void => {
      if (selection === 'source') {
        // copy block device mappings from source asg
        command.copySourceCustomBlockDeviceMappings = true;
        command.useAmiBlockDeviceMappings = false;
      } else if (selection === 'ami') {
        // use block device mappings from selected ami
        command.copySourceCustomBlockDeviceMappings = false;
        command.useAmiBlockDeviceMappings = true;
      } else {
        // use default block device mappings for selected instance type
        command.copySourceCustomBlockDeviceMappings = false;
        command.useAmiBlockDeviceMappings = false;
      }
    };

    cmd.regionIsDeprecated = (command: IHeCloudServerGroupCommand): boolean => {
      return (
        has(command, 'backingData.filtered.regions') &&
        command.backingData.filtered.regions.some(region => region.name === command.region && region.deprecated)
      );
    };

    return $q
      .all({
        credentialsKeyedByAccount: AccountService.getCredentialsKeyedByAccount('hecloud'),
        securityGroups: this.securityGroupReader.getAllSecurityGroups(),
        vpcList: VpcReader.listVpcs(),
        subnets: SubnetReader.listSubnetsByProvider('hecloud'),
        loadBalancers: this.loadBalancerReader.listLoadBalancers('hecloud'),
        preferredZones: AccountService.getPreferredZonesByAccount('hecloud'),
        keyPairs: KeyPairsReader.listKeyPairs(),
        instanceTypes: this.hecloudInstanceTypeService.getAllTypesByRegion(),
        enabledMetrics: $q.when(clone(this.enabledMetrics)),
        terminationPolicies: $q.when(clone(this.terminationPolicies)),
        diskTypes: $q.when(clone(this.diskTypes)),
      })
      .then((backingData: Partial<IHeCloudServerGroupCommandBackingData>) => {
        let securityGroupReloader = $q.when();
        backingData.accounts = keys(backingData.credentialsKeyedByAccount);
        backingData.filtered = {} as IHeCloudServerGroupCommandBackingDataFiltered;
        backingData.scalingProcesses = AutoScalingProcessService.listProcesses();
        backingData.appLoadBalancers = application.getDataSource('loadBalancers').data;
        cmd.backingData = backingData as IHeCloudServerGroupCommandBackingData;
        backingData.filtered.securityGroups = this.getRegionalSecurityGroups(cmd);
        if (cmd.viewState.disableImageSelection) {
          this.configureInstanceTypes(cmd);
        }
        if (backingData.loadBalancers && backingData.loadBalancers.length) {
          this.configureLoadBalancerOptions(cmd);
        }
        if (cmd.securityGroups && cmd.securityGroups.length) {
          const regionalSecurityGroupIds = map(this.getRegionalSecurityGroups(cmd), 'id');
          if (intersection(cmd.securityGroups, regionalSecurityGroupIds).length < cmd.securityGroups.length) {
            securityGroupReloader = this.refreshSecurityGroups(cmd, true);
          }
        }

        return securityGroupReloader.then(() => {
          this.applyOverrides('afterConfiguration', cmd);
          this.attachEventHandlers(cmd);
        });
      });
  }

  public applyOverrides(phase: string, command: IHeCloudServerGroupCommand): void {
    this.serverGroupCommandRegistry.getCommandOverrides('hecloud').forEach((override: any) => {
      if (override[phase]) {
        override[phase](command);
      }
    });
  }

  public configureKeyPairs(command: IHeCloudServerGroupCommand): IServerGroupCommandResult {
    const result: IHeCloudServerGroupCommandResult = { dirty: {} };
    if (command.credentials && command.region) {
      // isDefault is imperfect, since we don't know what the previous account/region was, but probably a safe bet
      const isDefault = some<any>(
        command.backingData.credentialsKeyedByAccount,
        c =>
          c.defaultKeyPair &&
          command.keyPair &&
          command.keyPair.indexOf(c.defaultKeyPair.replace('{{region}}', '')) === 0,
      );
      const filtered = chain(command.backingData.keyPairs)
        .filter({ account: command.credentials, region: command.region })
        .value();
      if (command.keyPair && filtered.length && !filtered.find(item => item.keyName === command.keyPair)) {
        const acct: IAccountDetails =
          command.backingData.credentialsKeyedByAccount[command.credentials] ||
          ({
            regions: [],
            defaultKeyPair: null,
          } as IAccountDetails);
        if (acct.defaultKeyPair) {
          // {{region}} is the only supported substitution pattern
          const defaultKeyPair = acct.defaultKeyPair.replace('{{region}}', command.region);
          if (isDefault && filtered.find(item => item.keyName === defaultKeyPair)) {
            command.keyPair = defaultKeyPair;
          } else {
            command.keyPair = null;
            result.dirty.keyPair = true;
          }
        } else {
          command.keyPair = null;
          result.dirty.keyPair = true;
        }
      }
      command.backingData.filtered.keyPairs = filtered;
    } else {
      command.backingData.filtered.keyPairs = [];
    }
    return result;
  }

  public configureInstanceTypes(command: IHeCloudServerGroupCommand): IServerGroupCommandResult {
    const result: IHeCloudServerGroupCommandResult = { dirty: {} };
    const filtered = this.hecloudInstanceTypeService.getAvailableTypesForRegions(command.backingData.instanceTypes, [
      command.region,
    ]);
    if (command.instanceType && !filtered.includes(command.instanceType)) {
      result.dirty.instanceType = command.instanceType;
      command.instanceType = null;
    }
    command.backingData.filtered.instanceTypes = filtered;
    extend(command.viewState.dirty, result.dirty);
    return result;
  }

  public configureImages(command: IHeCloudServerGroupCommand): IServerGroupCommandResult {
    const result: IHeCloudServerGroupCommandResult = { dirty: {} };
    if (command.viewState.disableImageSelection) {
      return result;
    }
    if (command.amiName && !command.region) {
      result.dirty.amiName = true;
      command.amiName = null;
    }
    return result;
  }

  public configureAvailabilityZones(command: IHeCloudServerGroupCommand): void {
    command.backingData.filtered.availabilityZones = find<IRegion>(
      command.backingData.credentialsKeyedByAccount[command.credentials].regions,
      { name: command.region },
    ).availabilityZones;
  }

  public configureVpcList(command: IHeCloudServerGroupCommand): IServerGroupCommandResult {
    const result: IHeCloudServerGroupCommandResult = { dirty: {} };
    const filteredData = command.backingData.filtered;
    if (command.region === null) {
      return result;
    }
    filteredData.vpcList = chain(command.backingData.vpcList)
      .filter({ account: command.credentials, region: command.region })
      .value();
    if (
      !command.vpcId ||
      (filteredData.vpcList.length && !filteredData.vpcList.find(vpc => vpc.id === command.vpcId))
    ) {
      command.vpcId = filteredData.vpcList[0].id;
    }
    if (command.vpcId) {
      command.vpcIdChanged(command);
    }

    return result;
  }

  public configureSubnetPurposes(command: IHeCloudServerGroupCommand): IServerGroupCommandResult {
    const result: IHeCloudServerGroupCommandResult = { dirty: {} };
    if (command.region === null) {
      return result;
    }
    command.backingData.filtered.subnetPurposes = chain(command.backingData.subnets)
      .filter({ account: command.credentials, region: command.region, vpcId: command.vpcId })
      .value();
    if (
      !command.subnetIds.every(subnetId =>
        command.backingData.filtered.subnetPurposes.find(subnet => subnet.id === subnetId),
      )
    ) {
      command.subnetIds = [];
    }
    return result;
  }

  public getRegionalSecurityGroups(command: IHeCloudServerGroupCommand): ISecurityGroup[] {
    const newSecurityGroups = command.backingData.securityGroups[command.credentials] || { hecloud: {} };
    return chain(newSecurityGroups.hecloud[command.region])
      .sortBy('name')
      .value();
  }

  public configureSecurityGroupOptions(command: IHeCloudServerGroupCommand): IServerGroupCommandResult {
    const result: IHeCloudServerGroupCommandResult = { dirty: {} };
    const currentOptions: ISecurityGroup[] = command.backingData.filtered.securityGroups;
    const newRegionalSecurityGroups = this.getRegionalSecurityGroups(command);
    const isExpression =
      typeof command.securityGroups === 'string' && (command.securityGroups as string).includes('${');
    if (currentOptions && command.securityGroups && !isExpression) {
      // not initializing - we are actually changing groups
      const currentGroupNames = command.securityGroups.map(groupId => {
        const match = find(currentOptions, { id: groupId });
        return match ? match.name : groupId;
      });

      const matchedGroups = command.securityGroups
        .map(groupId => {
          const securityGroup = find(currentOptions, { id: groupId }) || find(currentOptions, { name: groupId });
          return securityGroup ? securityGroup.name : null;
        })
        .map(groupName => find(newRegionalSecurityGroups, { name: groupName }))
        .filter(group => group);

      const matchedGroupNames = map(matchedGroups, 'name');
      const removed = xor(currentGroupNames, matchedGroupNames);
      command.securityGroups = map(matchedGroups, 'id');
      if (removed.length) {
        result.dirty.securityGroups = removed;
      }
    }
    command.backingData.filtered.securityGroups = newRegionalSecurityGroups.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });
    return result;
  }

  public refreshSecurityGroups(
    command: IHeCloudServerGroupCommand,
    skipCommandReconfiguration?: boolean,
  ): IPromise<void> {
    return this.cacheInitializer.refreshCache('securityGroups').then(() => {
      return this.securityGroupReader.getAllSecurityGroups().then(securityGroups => {
        command.backingData.securityGroups = securityGroups;
        if (!skipCommandReconfiguration) {
          this.configureSecurityGroupOptions(command);
        }
      });
    });
  }

  private getLoadBalancerMap(command: IHeCloudServerGroupCommand): IHeCloudLoadBalancerSourceData[] {
    if (command.backingData.loadBalancers) {
      return chain(command.backingData.loadBalancers)
        .map('accounts')
        .flattenDeep()
        .filter({ name: command.credentials })
        .map('regions')
        .flattenDeep()
        .filter({ name: command.region })
        .map<IHeCloudLoadBalancerSourceData>('loadBalancers')
        .flattenDeep<IHeCloudLoadBalancerSourceData>()
        .value();
    }

    const appLoadBalancers = command.backingData.appLoadBalancers || [];
    return appLoadBalancers.filter(lb => lb.region === command.region && lb.account === command.credentials);
  }

  public configureLoadBalancerOptions(command: IHeCloudServerGroupCommand): IServerGroupCommandResult {
    console.log('configureLoadBalancerOptions in');
    const result: IHeCloudServerGroupCommandResult = { dirty: {} };
    const newLoadBalancers = this.getLoadBalancerMap(command).filter(lb => {
      if (command.backingData.filtered.subnetPurposes) {
        return command.backingData.filtered.subnetPurposes.find(subnet => lb.subnetId === subnet.purpose);
      }
      return true;
    });
    command.backingData.filtered.lbList = newLoadBalancers;
    command.backingData.filtered.lbListenerMap = {};
    command.backingData.filtered.lbPoolMap = {};
    if (
      command.forwardLoadBalancers &&
      command.forwardLoadBalancers.every(flb => newLoadBalancers.find(nlb => nlb.id === flb.loadBalancerId))
    ) {
      this.refreshLoadBalancerListenerMap(command);
      this.refreshLoadBalancerPoolMap(command);
    } else {
      command.forwardLoadBalancers = [];
    }
    return result;
  }

  public refreshLoadBalancerListenerMap(command: IHeCloudServerGroupCommand) {
    return Promise.all(
      command.backingData.filtered.lbList.map(flb =>
        this.loadBalancerReader
          .getLoadBalancerDetails('hecloud', command.credentials, command.region, flb.id)
          .then(loadBalancers => ({
            [flb.id]: (loadBalancers && loadBalancers[0] && loadBalancers[0].listeners) || [],
          })),
      ),
    ).then(lbListenerMapArray => {
      command.backingData.filtered.lbListenerMap =
        lbListenerMapArray && lbListenerMapArray.length
          ? lbListenerMapArray.reduce((p, c) => ({ ...p, ...c }), {})
          : {};
    });
  }

  public refreshLoadBalancerPoolMap(command: IHeCloudServerGroupCommand) {
    return Promise.all(
      command.backingData.filtered.lbList.map(flb =>
        this.loadBalancerReader
          .getLoadBalancerDetails('hecloud', command.credentials, command.region, flb.id)
          .then(loadBalancers => ({
            [flb.id]: (loadBalancers && loadBalancers[0] && loadBalancers[0].pools) || [],
          })),
      ),
    ).then(lbPoolMapArray => {
      command.backingData.filtered.lbPoolMap =
        lbPoolMapArray && lbPoolMapArray.length ? lbPoolMapArray.reduce((p, c) => ({ ...p, ...c }), {}) : {};
    });
  }

  public configureListenerOptions(command: IHeCloudServerGroupCommand): IServerGroupCommandResult {
    const result: IHeCloudServerGroupCommandResult = { dirty: {} };
    command.backingData.filtered.listenerList = command.backingData.listenerList;
    return result;
  }

  public refreshListeners(command: IHeCloudServerGroupCommand) {
    return this.loadBalancerReader
      .getLoadBalancerDetails('hecloud', command.credentials, command.region, command.loadBalancerId)
      .then(loadBalancers => {
        command.backingData.listenerList = (loadBalancers && loadBalancers[0] && loadBalancers[0].listeners) || [];
        this.configureListenerOptions(command);
      });
  }

  // TODO: Instead of attaching these to the command itself, they could be static methods
  public attachEventHandlers(cmd: IHeCloudServerGroupCommand): void {
    cmd.usePreferredZonesChanged = (command: IHeCloudServerGroupCommand): IHeCloudServerGroupCommandResult => {
      const currentZoneCount = command.availabilityZones ? command.availabilityZones.length : 0;
      const result: IHeCloudServerGroupCommandResult = { dirty: {} };
      const preferredZonesForAccount = command.backingData.preferredZones[command.credentials];
      if (preferredZonesForAccount && preferredZonesForAccount[command.region] && command.viewState.usePreferredZones) {
        command.availabilityZones = cloneDeep(preferredZonesForAccount[command.region].sort());
      } else {
        command.availabilityZones = intersection(
          command.availabilityZones,
          command.backingData.filtered.availabilityZones,
        );
        const newZoneCount = command.availabilityZones ? command.availabilityZones.length : 0;
        if (currentZoneCount !== newZoneCount) {
          result.dirty.availabilityZones = true;
        }
      }
      return result;
    };

    cmd.vpcIdChanged = (command: IHeCloudServerGroupCommand): IServerGroupCommandResult => {
      const result: IHeCloudServerGroupCommandResult = { dirty: {} };
      extend(result.dirty, this.configureSubnetPurposes(command).dirty);
      extend(result.dirty, this.configureLoadBalancerOptions(command).dirty);
      command.viewState.dirty = command.viewState.dirty || {};
      extend(command.viewState.dirty, result.dirty);
      return result;
    };

    cmd.subnetChanged = (): IServerGroupCommandResult => {
      const result: IHeCloudServerGroupCommandResult = { dirty: {} };
      return result;
    };

    cmd.loadBalancerChanged = (command: IHeCloudServerGroupCommand): IServerGroupCommandResult => {
      const result: IHeCloudServerGroupCommandResult = { dirty: {} };
      extend(result.dirty, this.configureListenerOptions(command).dirty);
      return result;
    };

    cmd.regionChanged = (command: IHeCloudServerGroupCommand): IServerGroupCommandResult => {
      const result: IHeCloudServerGroupCommandResult = { dirty: {} };
      const filteredData = command.backingData.filtered;
      extend(result.dirty, this.configureVpcList(command).dirty);
      if (command.region) {
        extend(result.dirty, command.subnetChanged(command).dirty);
        extend(result.dirty, this.configureInstanceTypes(command).dirty);

        this.configureAvailabilityZones(command);
        extend(result.dirty, command.usePreferredZonesChanged(command).dirty);

        extend(result.dirty, this.configureImages(command).dirty);
        extend(result.dirty, this.configureKeyPairs(command).dirty);
        extend(result.dirty, this.configureSecurityGroupOptions(command).dirty);
      } else {
        filteredData.regionalAvailabilityZones = null;
      }

      return result;
    };

    cmd.clusterChanged = (command: IHeCloudServerGroupCommand): void => {
      command.moniker = NameUtils.getMoniker(command.application, command.stack, command.detail);
    };

    cmd.credentialsChanged = (command: IHeCloudServerGroupCommand): IServerGroupCommandResult => {
      const result: IHeCloudServerGroupCommandResult = { dirty: {} };
      const backingData = command.backingData;
      if (command.credentials) {
        const regionsForAccount: IAccountDetails =
          backingData.credentialsKeyedByAccount[command.credentials] ||
          ({ regions: [], defaultKeyPair: null } as IAccountDetails);
        backingData.filtered.regions = regionsForAccount.regions;
        if (!some(backingData.filtered.regions, { name: command.region })) {
          command.region = null;
          result.dirty.region = true;
        } else {
          extend(result.dirty, command.regionChanged(command).dirty);
        }
      } else {
        command.region = null;
      }
      return result;
    };

    cmd.imageChanged = (command: IHeCloudServerGroupCommand): IServerGroupCommandResult =>
      this.configureInstanceTypes(command);

    cmd.instanceTypeChanged = (command: IHeCloudServerGroupCommand): void => {
      command.ebsOptimized = this.hecloudInstanceTypeService.isEbsOptimized(command.instanceType);
    };

    this.applyOverrides('attachEventHandlers', cmd);
  }
}

export const AWS_SERVER_GROUP_CONFIGURATION_SERVICE = 'spinnaker.hecloud.serverGroup.configure.service';
module(AWS_SERVER_GROUP_CONFIGURATION_SERVICE, [
  SECURITY_GROUP_READER,
  require('hecloud/instance/hecloudInstanceType.service').name,
  LOAD_BALANCER_READ_SERVICE,
  CACHE_INITIALIZER_SERVICE,
  SERVER_GROUP_COMMAND_REGISTRY_PROVIDER,
]).service('hecloudServerGroupConfigurationService', HeServerGroupConfigurationService);
