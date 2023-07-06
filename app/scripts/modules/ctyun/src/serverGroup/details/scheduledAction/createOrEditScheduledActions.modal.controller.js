'use strict';

const angular = require('angular');

import { TaskExecutor, TaskMonitor } from '@spinnaker/core';
module.exports = angular
  .module('spinnaker.ctyun.serverGroup.details.scheduledActions.createOrEditScheduledActions.modal.controller', [])
  .controller('ctyunCreateOrEditScheduledActionsCtrl', [
    '$scope',
    '$uibModalInstance',
    'application',
    'serverGroup',
    'scheduledActions',
    function($scope, $uibModalInstance, application, serverGroup, scheduledActions) {
      this.dateFormat = date => {
        const nDate = new Date(date);
        const year = nDate.getFullYear();
        const month = nDate.getMonth() + 1;
        const day = nDate.getDate();
        const hour = nDate.getHours();
        const minute = nDate.getMinutes();
        const second = nDate.getSeconds();
        const monthStr = month > 9 ? month : `0${month}`;
        const dayStr = day > 9 ? day : `0${day}`;
        const hourStr = hour > 9 ? hour : `0${hour}`;
        const minuteStr = minute > 9 ? minute : `0${minute}`;
        const secondStr = second > 9 ? second : `0${second}`;
        return `${year}/${monthStr}/${dayStr} ${hourStr}:${minuteStr}:${secondStr}`;
      };
      this.timeFormat = date => {
        const nDate = new Date(date);
        const hour = nDate.getHours();
        const minute = nDate.getMinutes();
        const second = nDate.getSeconds();
        const hourStr = hour > 9 ? hour : `0${hour}`;
        const minuteStr = minute > 9 ? minute : `0${minute}`;
        const secondStr = second > 9 ? second : `0${second}`;
        return `1970/01/01 ${hourStr}:${minuteStr}:${secondStr}`;
      };

      this.availableActions = [
        { value: 1, label: 'Add' },
        { value: 2, label: 'Remove' },
        { value: 3, label: 'Set to' },
      ];
      this.adjustmentTypeOptions = [{ value: 1, label: 'instances' }, { value: 2, label: 'percent of group' }];
      this.weekList = [
        { value: 1, label: 'Monday', required: true },
        { value: 2, label: 'Tuesday', required: true },
        { value: 3, label: 'Wednesday', required: true },
        { value: 4, label: 'Thursday', required: true },
        { value: 5, label: 'Friday', required: true },
        { value: 6, label: 'Saturday', required: true },
        { value: 7, label: 'Sunday', required: true },
      ];
      this.dateList = [
        { value: 1, required: true },
        { value: 2, required: true },
        { value: 3, required: true },
        { value: 4, required: true },
        { value: 5, required: true },
        { value: 6, required: true },
        { value: 7, required: true },
        { value: 8, required: true },
        { value: 9, required: true },
        { value: 10, required: true },
        { value: 11, required: true },
        { value: 12, required: true },
        { value: 13, required: true },
        { value: 14, required: true },
        { value: 15, required: true },
        { value: 16, required: true },
        { value: 17, required: true },
        { value: 18, required: true },
        { value: 19, required: true },
        { value: 20, required: true },
        { value: 21, required: true },
        { value: 22, required: true },
        { value: 23, required: true },
        { value: 24, required: true },
        { value: 25, required: true },
        { value: 26, required: true },
        { value: 27, required: true },
        { value: 28, required: true },
        { value: 29, required: true },
        { value: 30, required: true },
        { value: 31, required: true },
      ];

      this.viewState = {
        isNew: !scheduledActions.ruleID,
      };
      this.commandType = 2;
      this.command = {
        ruleID: scheduledActions.ruleID ? scheduledActions.ruleID : '',
        name: scheduledActions.name ? scheduledActions.name : '',
        status: scheduledActions.ruleID ? scheduledActions.status : '',
        type: scheduledActions.type,
        operateUnit: scheduledActions.operateUnit,
        operateCount: scheduledActions.operateCount,
        action: scheduledActions.action,
        cycle: scheduledActions.cycle || 1,
        day: {},
        effectiveFrom: scheduledActions.effectiveFrom
          ? new Date(this.dateFormat(scheduledActions.effectiveFrom))
          : new Date(this.dateFormat(new Date())),
        effectiveTill: scheduledActions.effectiveTill
          ? new Date(this.dateFormat(scheduledActions.effectiveTill))
          : new Date(this.dateFormat(new Date().getTime() + 2592000000)),
        executionTime: scheduledActions.executionTime
          ? new Date(this.dateFormat(scheduledActions.executionTime))
          : new Date(this.dateFormat(new Date().getTime() + 120000)),
      };

      if (scheduledActions.day) {
        if (this.command.cycle == 1) {
          scheduledActions.day.forEach(day => {
            this.command.day[day] = true;
          });
        }
        if (this.command.cycle == 2) {
          scheduledActions.day.forEach(day => {
            let weeks = this.weekList.find(item => item.value == day);
            this.command.day[weeks.label] = true;
          });
        }
      }

      $scope.serverGroup = serverGroup;

      this.weekChange = () => {
        let checkStatus = false;
        this.weekList.forEach(week => {
          if (!!this.command.day[week.label]) {
            checkStatus = true;
          }
        });
        if (checkStatus) {
          this.weekList.forEach(week => (week.required = false));
        } else {
          this.weekList.forEach(week => (week.required = true));
        }
      };

      this.dateChange = () => {
        let checkStatus = false;
        this.dateList.forEach(date => {
          if (!!this.command.day[date.value]) {
            checkStatus = true;
          }
        });
        if (checkStatus) {
          this.dateList.forEach(date => (date.required = false));
        } else {
          this.dateList.forEach(date => (date.required = true));
        }
      };

      this.typeChange = () => {
        if (this.command.type == 2) {
          this.command.executionTime = scheduledActions.executionTime
            ? new Date(this.dateFormat(scheduledActions.executionTime))
            : new Date(this.dateFormat(new Date().getTime() + 120000));
        } else if (this.command.type == 3) {
          this.command.executionTime = scheduledActions.executionTime
            ? new Date(this.timeFormat(scheduledActions.executionTime))
            : new Date(this.timeFormat(new Date()));
        }
      };
      this.typeChange();
      this.weekChange();
      this.dateChange();

      $scope.taskMonitor = new TaskMonitor({
        application: application,
        title: 'Update Scheduled Actions for ' + serverGroup.name,
        modalInstance: $uibModalInstance,
        onTaskComplete: () => application.serverGroups.refresh(),
      });

      this.submit = () => {
        let submitCommand = {
          type: 'upsertCtyunScheduledActions',
          application: application.name,
          account: serverGroup.account,
          accountName: serverGroup.account,
          credentials: serverGroup.account,
          cloudProvider: 'ctyun',
          region: serverGroup.region,
          serverGroupName: serverGroup.name,
          operationType: this.viewState.isNew ? 'CREATE' : 'MODIFY',
          regionID: serverGroup.region,
          groupID: serverGroup.asg.groupID,
          operateUnit: this.command.operateUnit,
          operateCount: this.command.operateCount,
          action: this.command.action,
          executionTime: this.dateFormat(this.command.executionTime),
          ruleType: this.command.type,
        };
        if (this.command.ruleID) {
          submitCommand.ruleID = this.command.ruleID;
          submitCommand.name = this.command.name;
          submitCommand.status = this.command.status;
        }
        if (this.command.type == 3) {
          submitCommand.cycle = this.command.cycle;
          submitCommand.executionTime = submitCommand.executionTime.split(' ')[1];
          submitCommand.effectiveFrom = this.dateFormat(this.command.effectiveFrom);
          submitCommand.effectiveTill = this.dateFormat(this.command.effectiveTill);
          if (submitCommand.cycle == 2) {
            submitCommand.day = [];
            this.weekList.forEach(item => {
              if (this.command.day[item.label]) {
                submitCommand.day.push(item.value);
              }
            });
          } else if (submitCommand.cycle == 1) {
            submitCommand.day = [];
            this.dateList.forEach(item => {
              if (this.command.day[item.value]) {
                submitCommand.day.push(item.value);
              }
            });
          }
        }
        let description = (this.viewState.isNew ? 'Create' : 'Edit') + ' Scaling Policy for ' + serverGroup.name;
        var submitMethod = function() {
          return TaskExecutor.executeTask({
            job: [submitCommand],
            application: application,
            description: description,
          });
        };

        $scope.taskMonitor.submit(submitMethod);
      };

      this.cancel = $uibModalInstance.dismiss;
    },
  ]);
