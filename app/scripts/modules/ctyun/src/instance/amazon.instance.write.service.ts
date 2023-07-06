import { IPromise, module } from 'angular';

import {
  Application,
  IMultiInstanceGroup,
  IMultiInstanceJob,
  INSTANCE_WRITE_SERVICE,
  InstanceWriter,
  ITask,
  PROVIDER_SERVICE_DELEGATE,
  ProviderServiceDelegate,
  TaskExecutor,
  ServerGroupReader,
  IServerGroup,
} from '@spinnaker/core';

import { IAmazonInstance } from 'ctyun/domain';

export interface IAmazonMultiInstanceGroup extends IMultiInstanceGroup {
  targetGroups: string[];
}

export interface IAmazonMultiInstanceJob extends IMultiInstanceJob {
  targetGroupNames?: string[];
}

export class AmazonInstanceWriter extends InstanceWriter {
  public static $inject = ['providerServiceDelegate'];
  public constructor(protected providerServiceDelegate: ProviderServiceDelegate) {
    super(providerServiceDelegate);
  }

  public deregisterInstancesFromTargetGroup(
    instanceGroups: IMultiInstanceGroup[],
    application: Application,
    targetGroupNames: string[],
  ): IPromise<ITask> {
    const jobs = this.buildMultiInstanceJob(
      instanceGroups,
      'deregisterInstancesFromLoadBalancer',
    ) as IAmazonMultiInstanceJob[];
    jobs.forEach(job => (job.targetGroupNames = targetGroupNames));
    const descriptor = this.buildMultiInstanceDescriptor(jobs, 'Deregister', `from ${targetGroupNames.join(' and ')}`);
    return TaskExecutor.executeTask({
      job: jobs,
      application,
      description: descriptor,
    });
  }

  public deregisterInstanceFromTargetGroup(
    instance: IAmazonInstance,
    application: Application,
    params: any = {},
  ): IPromise<ITask> {
    params.type = 'deregisterInstancesFromLoadBalancer';
    params.instanceIds = [instance.id];
    params.targetGroupNames = instance.targetGroups;
    params.region = instance.region;
    params.credentials = instance.account;
    params.cloudProvider = instance.cloudProvider;
    return TaskExecutor.executeTask({
      job: [params],
      application,
      description: `Deregister instance: ${instance.id}`,
    });
  }

  public registerInstancesWithTargetGroup(
    instanceGroups: IMultiInstanceGroup[],
    application: Application,
    targetGroupNames: string[],
  ) {
    const jobs = this.buildMultiInstanceJob(
      instanceGroups,
      'registerInstancesWithLoadBalancer',
    ) as IAmazonMultiInstanceJob[];
    jobs.forEach(job => (job.targetGroupNames = targetGroupNames));
    const descriptor = this.buildMultiInstanceDescriptor(jobs, 'Register', `with ${targetGroupNames.join(' and ')}`);
    return TaskExecutor.executeTask({
      job: jobs,
      application,
      description: descriptor,
    });
  }

  public registerInstanceWithTargetGroup(
    instance: IAmazonInstance,
    application: Application,
    params: any = {},
  ): IPromise<ITask> {
    params.type = 'registerInstancesWithLoadBalancer';
    params.instanceIds = [instance.id];
    params.targetGroupNames = instance.targetGroups;
    params.region = instance.region;
    params.credentials = instance.account;
    params.cloudProvider = instance.cloudProvider;
    return TaskExecutor.executeTask({
      job: [params],
      application,
      description: `Register instance: ${instance.id}`,
    });
  }

  public ctyunRebootInstance(instance: IAmazonInstance, application: Application, params: any = {}): IPromise<ITask> {
    params.type = 'rebootInstances';
    params.instanceIds = [instance.instanceIdStr];
    params.region = instance.region;
    params.zone = instance.zone;
    params.credentials = instance.account;
    params.cloudProvider = instance.cloudProvider;
    params.application = application.name;
    return TaskExecutor.executeTask({
      job: [params],
      application,
      description: `Reboot instance: ${instance.id}`,
    });
  }

  public ctyunTerminateInstance(
    instance: IAmazonInstance,
    application: Application,
    params: any = {},
  ): IPromise<ITask> {
    params.type = 'terminateInstances';
    params['instanceIds'] = [instance.instanceIdStr];
    params['region'] = instance.region;
    params['zone'] = instance.zone;
    params['credentials'] = instance.account;
    return TaskExecutor.executeTask({
      job: [params],
      application,
      description: `Terminate instance: ${instance.id}`,
    });
  }

  public ctyunTerminateInstanceAndShrinkServerGroup(
    instance: IAmazonInstance,
    application: Application,
    params: any = {},
  ): IPromise<ITask> {
    return ServerGroupReader.getServerGroup(
      application.name,
      instance.account,
      instance.region,
      instance.serverGroup,
    ).then((serverGroup: IServerGroup) => {
      params.type = 'terminateInstanceAndDecrementServerGroup';
      params.instance = instance.id;
      params.serverGroupName = instance.serverGroup;
      params.asgName = instance.serverGroup; // still needed on the backend
      params.region = instance.region;
      params.credentials = instance.account;
      params.cloudProvider = instance.cloudProvider;
      params.adjustMinIfNecessary = true;
      params.setMaxToNewDesired = serverGroup.asg.minSize === serverGroup.asg.maxSize;
      return TaskExecutor.executeTask({
        job: [params],
        application,
        description: `Terminate instance ${instance.id} and shrink ${instance.serverGroup}`,
      });
    });
  }
}

export const AMAZON_INSTANCE_WRITE_SERVICE = 'spinnaker.ctyun.instance.write.service';
module(AMAZON_INSTANCE_WRITE_SERVICE, [INSTANCE_WRITE_SERVICE, PROVIDER_SERVICE_DELEGATE]).service(
  'amazonInstanceWriter',
  AmazonInstanceWriter,
);
