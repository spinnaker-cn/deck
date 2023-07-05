'use strict';

const angular = require('angular');

import { CONFIRMATION_MODAL_SERVICE } from '@spinnaker/core';

import { SCALING_POLICY_POPOVER } from './popover/scalingPolicyPopover.component';
import { ScalingPolicyWriter } from './ScalingPolicyWriter';

import './scalingPolicySummary.component.less';

module.exports = angular
  .module('spinnaker.ctyun.serverGroup.details.scalingPolicy.alarmBasedSummary.component', [
    require('./upsert/upsertScalingPolicy.controller').name,
    SCALING_POLICY_POPOVER,
    CONFIRMATION_MODAL_SERVICE,
  ])
  .component('ctyunAlarmBasedSummary', {
    bindings: {
      policy: '=',
      serverGroup: '=',
      application: '=',
    },
    templateUrl: require('./alarmBasedSummary.component.html'),
    controller: [
      '$uibModal',
      'confirmationModalService',
      function($uibModal, confirmationModalService) {
        this.popoverTemplate = require('./popover/scalingPolicyDetails.popover.html');

        this.ruleTypeList = {
          1: 'alarm', // 告警
          2: 'scheduled', // 定时
          3: 'cycle', // 周期
        };
        this.actionObj = {
          1: 'add', // '增加'
          2: 'remove', // '减少',
          3: 'set to', // 设置为
        };
        this.operateUnitObj = {
          1: '', // 个
          2: '%', // 百分比
        };
        this.comparisonOperatorObj = {
          eq: '=',
          gt: '＞',
          ge: '≥',
          lt: '＜',
          le: '≤',
        };
        this.getWeek = weekList => {
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

        this.editPolicy = () => {
          $uibModal.open({
            templateUrl: require('./upsert/upsertScalingPolicy.modal.html'),
            controller: 'ctyunUpsertScalingPolicyCtrl',
            controllerAs: 'ctrl',
            size: 'lg',
            resolve: {
              policy: () => this.policy,
              serverGroup: () => this.serverGroup,
              application: () => this.application,
            },
          });
        };

        this.deletePolicy = () => {
          var taskMonitor = {
            application: this.application,
            title: 'Deleting scaling policy ' + this.policy.name,
            onTaskComplete: () => this.application.serverGroups.refresh(),
          };

          var submitMethod = () =>
            ScalingPolicyWriter.deleteScalingPolicy(this.application, this.serverGroup, this.policy);

          confirmationModalService.confirm({
            header: 'Really delete ' + this.policy.name + '?',
            buttonText: 'Delete scaling policy',
            account: this.serverGroup.account, // don't confirm if it's a junk policy
            provider: 'ctyun',
            taskMonitorConfig: taskMonitor,
            submitMethod: submitMethod,
          });
        };
      },
    ],
  });
