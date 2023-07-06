import * as React from 'react';
import { TaskExecutor, ReactInjector, ITaskMonitorConfig, ModalInjector, Tooltip } from '@spinnaker/core';
import { IScheduledAction } from 'ctyun/domain';

import { IScalingPolicy } from 'ctyun/domain';

export interface IScheduledActionProps {
  action: any;
  application?: any;
  serverGroup?: any;
}

export class ScheduledAction extends React.Component<IScheduledActionProps> {
  private deleteScheduledAction(action: IScheduledAction): void {
    const { application, serverGroup } = this.props;
    const taskMonitor: ITaskMonitorConfig = {
      application: application,
      title: 'Deleting scaling policy ' + action.name + '(' + action.ruleID + ')',
      onTaskComplete: () => application.serverGroups.refresh(),
    };

    ReactInjector.confirmationModalService.confirm({
      header: `Really delete ${action.name}(${action.ruleID})?`,
      buttonText: 'Delete scaling policy',
      account: serverGroup.account,
      provider: 'ctyun',
      taskMonitorConfig: taskMonitor,
      submitMethod: () => {
        return TaskExecutor.executeTask({
          job: [
            {
              type: 'deleteCtyunScheduledAction',
              applications: application.name,
              account: serverGroup.account,
              accountName: serverGroup.account,
              cloudProvider: 'ctyun',
              region: serverGroup.region,
              serverGroupName: serverGroup.name,
              scheduledActionId: action.ruleID,
              credentials: serverGroup.account,
              groupId: action.scalingGroupID,
              ruleType: action.ruleType,
            },
          ],
          application: application,
          description: 'Delete scaling policy ' + action.name,
        });
      },
    });
  }

  private editPolicy(policy: IScalingPolicy): void {
    ModalInjector.modalService.open({
      templateUrl: require('../scheduledAction/createOrEditScheduledActions.modal.html'),
      controller: 'ctyunCreateOrEditScheduledActionsCtrl as ctrl',
      size: 'lg',
      resolve: {
        application: () => this.props.application,
        serverGroup: () => this.props.serverGroup,
        scheduledActions: () => {
          return {
            ...policy,
            type: policy.ruleType,
          };
        },
      },
    });
  }

  public render() {
    const { action } = this.props;
    const actionObj: {
      [key: string]: string;
    } = {
      1: 'add', // '增加'
      2: 'reduce', // '减少',
      3: 'set to', // 设置为
    };
    const operateUnitObj: {
      [key: string]: string;
    } = {
      1: '', // 个
      2: '%', // 百分比
    };
    const comparisonOperatorObj: {
      [key: string]: string;
    } = {
      eq: '=',
      gt: '＞',
      ge: '≥',
      lt: '＜',
      le: '≤',
    };
    const getWeek = (weekList: Number[]) => {
      let str = '';
      weekList.forEach(week => {
        if (str) {
          str += ', ';
        }
        switch (week) {
          case 1:
            str += 'monday';
            break;
          case 2:
            str += 'tuesday';
            break;
          case 3:
            str += 'wednesday';
            break;
          case 4:
            str += 'thursday';
            break;
          case 5:
            str += 'friday';
            break;
          case 6:
            str += 'saturday';
            break;
          case 7:
            str += 'sunday';
        }
      });
      return str;
    };
    return (
      <div style={{ marginBottom: '20px' }}>
        <dl className="horizontal-when-filters-collapsed" style={{ marginBottom: '0px' }}>
          {/* <dt>Schedule Action ID/Name</dt>
          <dd>
            {action.scheduledActionId}({action.scheduledActionName})
          </dd>
          <dt>Start Time</dt>
          <dd>{action.startTime}</dd>
          <dt>Schedule</dt>
          <dd>{action.recurrence}</dd>
          <dt>End Time</dt>
          <dd>{action.endTime}</dd>
          {action.minSize !== undefined && <dt>Min Size</dt>}
          {action.minSize !== undefined && <dd>{action.minSize}</dd>}
          {action.maxSize !== undefined && <dt>Max Size</dt>}
          {action.maxSize !== undefined && <dd>{action.maxSize}</dd>}
          {action.desiredCapacity !== undefined && <dt>Desired Size</dt>}
          {action.desiredCapacity !== undefined && <dd>{action.desiredCapacity}</dd>} */}
          {action.ruleType == 2 && (
            <div>
              <dt>Scheduled Action Name/ID</dt>
              <dd>
                {action.name}({action.ruleID})
              </dd>
              <dt>Trigger time</dt>
              <dd>{action.executionTime}</dd>
              <dt>Execute Action</dt>
              <dd>
                {actionObj[action.action]} {action.operateCount}
                {operateUnitObj[action.operateUnit]} instances
              </dd>
            </div>
          )}
          {action.ruleType == 3 && (
            <div>
              <dt>Periodic Action Name/ID</dt>
              <dd>
                {action.name}({action.ruleID})
              </dd>
              <dt>Effective time</dt>
              <dd>
                from {action.effectiveFrom} to {action.effectiveTill}
              </dd>
              <dt>Trigger time</dt>
              {action.cycle == 1 && (
                <dd>
                  {action.executionTime.split(' ')[1]} on the {action.day.join('th, ')}
                  {action.day.length > 0 ? 'th' : ''} of each month
                </dd>
              )}
              {action.cycle == 2 && (
                <dd>
                  every {getWeek(action.day)} {action.executionTime.split(' ')[1]}
                </dd>
              )}
              {action.cycle == 3 && <dd>Daily {action.executionTime.split(' ')[1]}</dd>}
              <dt>Execute Action</dt>
              <dd>
                {actionObj[action.action]} {action.operateCount}
                {operateUnitObj[action.operateUnit]} instances
              </dd>
            </div>
          )}
        </dl>
        <div className="actions text-right">
          <button
            className="btn btn-xs btn-link"
            onClick={() => {
              this.editPolicy(action);
            }}
          >
            <Tooltip value="Edit policy">
              <span className="glyphicon glyphicon-cog" uib-tooltip="Edit policy" />
            </Tooltip>
            <span className="sr-only">Edit policy</span>
          </button>
          <button
            className="btn btn-xs btn-link"
            onClick={() => {
              this.deleteScheduledAction(action);
            }}
          >
            <Tooltip value="Delete policy">
              <span className="glyphicon glyphicon-trash" uib-tooltip="Delete policy" />
            </Tooltip>
            <span className="sr-only">Delete policy</span>
          </button>
        </div>
      </div>
    );
  }
}
