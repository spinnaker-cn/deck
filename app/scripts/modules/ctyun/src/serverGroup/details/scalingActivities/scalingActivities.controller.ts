import { IController, module } from 'angular';
import * as _ from 'lodash';
import { IModalServiceInstance } from 'angular-ui-bootstrap';

import { ServerGroupReader } from '@spinnaker/core';
import { IServerGroup } from '@spinnaker/core';

export interface IScalingActivitiesViewState {
  loading: boolean;
  error: boolean;
}

export interface IScalingEvent {
  description: string;
  availabilityZone: string;
}

export interface IScalingEventSummary {
  cause: string;
  events: IScalingEvent[];
  startTime: number;
  statusCode: any;
  isSuccessful: boolean;
  beforeCount?: number;
  afterCount?: number;
  instanceNameStr?: '';
}

export interface IRawScalingActivity {
  executionMode?: string;
  executionResult?: number;
  details: string;
  description: string;
  cause: string;
  statusCode: any;
  startTime: number;
}

export class ScalingActivitiesCtrl implements IController {
  public viewState: IScalingActivitiesViewState;
  public activities: any = [];

  public static $inject = ['$uibModalInstance', 'serverGroup'];
  public constructor(private $uibModalInstance: IModalServiceInstance, public serverGroup: IServerGroup) {
    this.serverGroup = serverGroup;
  }

  private groupActivities(activities: IRawScalingActivity[]): void {
    const grouped: any = activities,
      results: IScalingEventSummary[] = [];
    const getGroupActivitiesStr: {
      [key: string]: string;
    } = {
      1: '自动执行策略',
      2: '手动执行策略。',
      3: '手动移入实例。',
      4: '手动移出实例。',
      5: '新建伸缩组满足最小数。',
      6: '修改伸缩组满足最大最小限制。',
      7: '健康检查移入。',
      8: '健康检查移出。',
    };
    _.forOwn(grouped, group => {
      console.log('cccccccc', group);
      if (group) {
        const events: IScalingEvent[] = [];
        // group.forEach((entry: any) => {
        //   let availabilityZone = 'unknown';
        //   try {
        //     availabilityZone = JSON.parse(entry.details)['Availability Zone'] || availabilityZone;
        //   } catch (e) {
        //     // I don't imagine this would happen but let's not blow up the world if it does.
        //   }
        //   events.push({ description: entry.description, availabilityZone });
        // });
        group.instanceNameStr = '';
        group.instanceList.forEach((instance: { [key: string]: string }) => {
          if (group.instanceNameStr) {
            group.instanceNameStr += ',';
          }
          group.instanceNameStr += instance.instanceName;
        });
        results.push({
          cause: getGroupActivitiesStr[group.executionMode],
          events,
          startTime: group.startTime,
          statusCode: group.executionResult,
          isSuccessful: group.executionResult == 1,
          beforeCount: group.beforeCount,
          afterCount: group.afterCount,
          instanceNameStr: group.instanceNameStr,
        });
      }
    });
    this.activities = _.sortBy(results, 'startTime').reverse();
    console.log('ddddddddd>>>>>', this.activities);
  }

  public $onInit(): void {
    this.viewState = {
      loading: true,
      error: false,
    };
    ServerGroupReader.getScalingActivities(this.serverGroup).then(
      (activities: IRawScalingActivity[]) => {
        this.viewState.loading = false;
        console.log('aaaaaa>>>>', activities);
        this.groupActivities(activities);
      },
      () => {
        this.viewState.error = true;
      },
    );
  }

  public close(): void {
    this.$uibModalInstance.close();
  }
}

export const SCALING_ACTIVITIES_CTRL = 'spinnaker.core.serverGroup.scalingActivities.controller';
module(SCALING_ACTIVITIES_CTRL, []).controller('ScalingActivitiesCtrl', ScalingActivitiesCtrl);
