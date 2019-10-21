import {  module } from 'angular';
import { Application, NameUtils, IServerGroupCommand, FirewallLabels, ISecurityGroup, ITask, IMoniker, IJob, TaskExecutor } from '@spinnaker/core'
import { ICapacity } from '../../../../core/src/serverGroup';
import { IAsg, IEntityTags, IExecution, IInstance, IInstanceCounts } from '../../../../core/src/domain';

export interface ICapacitys {
  desired: number | string;
  max: number | string;
  min: number | string;
}

export interface IServerGroup {
  account: string;
  result?: any;
  app?: string;
  asg?: IAsg;
  buildInfo?: any;
  category?: string;
  capacity?: ICapacity;
  cloudProvider: string;
  cluster: string;
  clusterEntityTags?: IEntityTags[];
  createdTime?: number;
  detachedInstances?: IInstance[];
  detail?: string;
  disabledDate?: number;
  entityTags?: IEntityTags;
  insightActions?: Array<{ url: string; label: string }>;
  instanceCounts: IInstanceCounts;
  instances: IInstance[];
  instanceType?: string;
  isDisabled?: boolean;
  labels?: { [key: string]: string };
  launchConfig?: any;
  loadBalancers?: string[];
  name: string;
  namespace?: string;
  moniker?: IMoniker;
  provider?: string;
  providerMetadata?: any;
  region: string;
  runningExecutions?: IExecution[];
  runningTasks?: ITask[];
  searchField?: string;
  securityGroups?: string[];
  serverGroupManagers?: Array<{ account: string; location: string; name: string }>;
  stack?: string;
  stringVal?: string;
  subnetType?: string;
  tags?: any;
  type: string;
  vpcId?: string;
  vpcName?: string;
}

export interface IServerGroupJobs extends IJob {
  amiName?: string;
  asgName?: string;
  capacity?: Partial<ICapacitys>;
  credentials?: string;
  cloudProvider?: string;
  region?: string;
  imageId?: string;
  scalingGroupName?: string;
  tags?: string[];
  systemDiskSize?: number;
  spotStrategy?: string;
  keyPairName?: string;
  instanceType?: string;
  instanceTypes?: string[];
  spotPriceLimit?: any[];
  internetMaxBandwidthOut?: number;
  loadBalancerWeight?: number;
  systemDiskCategory?: string;
  securityGroups?: string[];
  scalingGroups?: any[];
  defaultCooldown?: number;
  serverGroupName?: string;
  type?: string;
  moniker?: IMoniker;
}

export class ServerGroupWriters {

  public static $inject = ['serverGroupTransformer'];
  constructor(private serverGroupTransformer: any) {}

  public cloneServerGroups(command: IServerGroupCommand, application: Application): ng.IPromise<ITask> {
    let description: string;
    if (command.viewState.mode === 'clone') {
      description = `Create Cloned Server Group from ${command.source.asgName}`;
      command.type = 'cloneServerGroup';
    } else {
      command.type = 'createServerGroup';
      description = `Create New Server Group in cluster ${NameUtils.getClusterName(
        application.name,
        command.stack,
        command.freeFormDetails,
      )}`;
    }

    return TaskExecutor.executeTask({
      job: [this.serverGroupTransformer.convertServerGroupCommandToDeployConfiguration(command)],
      application,
      description,
    });
  }

  public disableServerGroups(
    serverGroup: IServerGroup,
    appName: string,
    params: IServerGroupJobs = {},
  ): ng.IPromise<ITask> {
    params.asgName = serverGroup.name;
    params.serverGroupName = serverGroup.name;
    params.moniker = serverGroup.moniker;
    params.type = 'disableServerGroup';
    params.region = serverGroup.region;
    params.credentials = serverGroup.account;
    params.cloudProvider = serverGroup.type || serverGroup.provider;

    return TaskExecutor.executeTask({
      job: [params],
      application: appName,
      description: `Disable Server Group: ${serverGroup.name}`,
    });
  }
  public destroyServerGroups(
    serverGroup: IServerGroup,
    application: Application,
    params: IServerGroupJobs = {},
  ): ng.IPromise<ITask> {
    params.asgName = serverGroup.name;
    params.moniker = serverGroup.moniker;
    params.serverGroupName = serverGroup.name;
    params.type = 'destroyServerGroup';
    params.region = serverGroup.region;
    params.scalingGroupName = serverGroup.name;
    params.credentials = serverGroup.account;
    params.cloudProvider = serverGroup.type || serverGroup.provider;

    return TaskExecutor.executeTask({
      job: [params],
      application,
      description: `Destroy Server Group: ${serverGroup.name}`,
    });
  }

  public enableServerGroups(
    serverGroup: IServerGroup,
    application: Application,
    params: IServerGroupJobs = {},
  ): ng.IPromise<ITask> {
    params.asgName = serverGroup.name;
    params.serverGroupName = serverGroup.name;
    params.moniker = serverGroup.moniker;
    params.type = 'enableServerGroup';
    params.region = serverGroup.region;
    params.credentials = serverGroup.account;
    params.cloudProvider = serverGroup.type || serverGroup.provider;

    return TaskExecutor.executeTask({
      job: [params],
      application,
      description: `Enable Server Group: ${serverGroup.name}`,
    });
  }

  private getCapacityStrings(capacity: Partial<ICapacitys>): string {
    if (!capacity) {
      return null;
    }
    return Object.keys(capacity)
      .map((k: keyof ICapacitys) => `${k}: ${capacity[k]}`)
      .join(', ');
  }

  public resizeServerGroups(
    serverGroup: IServerGroup,
    application: Application,
    params: IServerGroupJobs = {},
  ): ng.IPromise<ITask> {
    params.asgName = serverGroup.name;
    params.serverGroupName = serverGroup.name;
    params.moniker = serverGroup.moniker;
    params.type = 'resizeServerGroup';
    params.region = serverGroup.region;
    params.credentials = serverGroup.account;
    params.cloudProvider = serverGroup.type || serverGroup.provider;
    const currentSize: string = this.getCapacityStrings(serverGroup.capacity);
    const newSize: string = this.getCapacityStrings(params.capacity);
    const currentSizeText = currentSize ? ` from (${currentSize}) ` : ' ';

    return TaskExecutor.executeTask({
      job: [params],
      application,
      description: `Resize Server Group: ${serverGroup.name}${currentSizeText}to (${newSize})`,
    });
  }

  public editServerGroups (
    serverGroup: IServerGroup,
    application: Application,
    params: IServerGroupJobs = {},
  ): ng.IPromise<ITask> {
    params.type = 'modifyScalingGroup';
    params.asgName = serverGroup.name;
    params.scalingGroups = [
      {
        'scalingGroupName' : serverGroup.name,
        'region' : serverGroup.region
      }
    ];
    params.defaultCooldown = serverGroup.result.scalingGroup.defaultCooldown;
    params.credentials = serverGroup.account;
    params.cloudProvider = serverGroup.type || serverGroup.provider;

    return TaskExecutor.executeTask({
      job: [params],
      application,
      description: `Update Advanced Settings for ${serverGroup.name}`,
    });
  }
  public rollbackServerGroups(
    serverGroup: IServerGroup,
    application: Application,
    params: IServerGroupJobs = {},
  ): ng.IPromise<ITask> {
    params.type = 'rollbackServerGroup';
    params.moniker = serverGroup.moniker;
    params.region = serverGroup.region;
    params.credentials = serverGroup.account;
    params.cloudProvider = serverGroup.type || serverGroup.provider;

    return TaskExecutor.executeTask({
      job: [params],
      application,
      description: `Rollback Server Group: ${serverGroup.name}`,
    });
  }

  public updateSecurityGroupss(
    serverGroup: IServerGroup,
    securityGroups: ISecurityGroup[],
    application: Application,
  ): ng.IPromise<ITask> {
    const job: IServerGroupJobs = {
      moniker: serverGroup.moniker,
      cloudProvider: serverGroup.type || serverGroup.provider,
      credentials: serverGroup.account,
      region: serverGroup.region,
      securityGroups: securityGroups.map((group: ISecurityGroup) => group.id),
      serverGroupName: serverGroup.name,
      type: 'updateLaunchConfig',
    };

    return TaskExecutor.executeTask({
      job: [job],
      application,
      description: `Update ${FirewallLabels.get('firewalls')} for ${serverGroup.name}`,
    });
  }
  public updateLaunchConfigs(
    serverGroup: IServerGroup,
    application: Application,
  ): ng.IPromise<ITask> {
    const job: IServerGroupJobs = {
      cloudProvider: serverGroup.type || serverGroup.provider,
      credentials: serverGroup.account,
      region: serverGroup.region,
      serverGroupName: serverGroup.name,
      systemDiskCategory: serverGroup.result.scalingConfiguration.systemDiskCategory,
      systemDiskSize: serverGroup.result.scalingConfiguration.systemDiskSize,
      tags: serverGroup.result.scalingConfiguration.tags,
      loadBalancerWeight: serverGroup.result.scalingConfiguration.loadBalancerWeight,
      internetMaxBandwidthOut: serverGroup.result.scalingConfiguration.internetMaxBandwidthOut,
      spotStrategy: serverGroup.result.scalingConfiguration.spotStrategy,
      instanceType: serverGroup.result.scalingConfiguration.instanceType,
      keyPairName: serverGroup.result.scalingConfiguration.keyPairName,
      imageId: serverGroup.result.scalingConfiguration.imageId,
      type: 'updateLaunchConfig',
    };
    const spl = serverGroup.result.scalingConfiguration.spotPriceLimit
    if ( spl.length > 0 ) {
      job.spotPriceLimit = spl
    }

    return TaskExecutor.executeTask({
      job: [job],
      application,
      description: `Update ${FirewallLabels.get('firewalls')} for ${serverGroup.name}`,
    });
  }
}

export const SERVER_GROUP_WRITER_ALI = 'spinnaker.alicloud.serverGroup.write.service';
module(SERVER_GROUP_WRITER_ALI, []).service(
  'serverGroupWriters',
  ServerGroupWriters,
);
