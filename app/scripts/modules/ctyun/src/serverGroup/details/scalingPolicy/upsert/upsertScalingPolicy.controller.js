'use strict';

const angular = require('angular');

import { TaskMonitor } from '@spinnaker/core';

import { STEP_POLICY_ACTION } from './step/stepPolicyAction.component';
import { ScalingPolicyWriter } from '../ScalingPolicyWriter';

import './upsertScalingPolicy.modal.less';

module.exports = angular
  .module('spinnaker.ctyun.serverGroup.details.scalingPolicy.upsertScalingPolicy.controller', [
    require('exports-loader?"n3-line-chart"!n3-charts/build/LineChart'),
    require('./simple/simplePolicyAction.component').name,
    STEP_POLICY_ACTION,
    require('./alarm/alarmConfigurer.component').name,
  ])
  .controller('ctyunUpsertScalingPolicyCtrl', [
    '$uibModalInstance',
    'serverGroup',
    'application',
    'policy',
    function($uibModalInstance, serverGroup, application, policy) {
      this.serverGroup = serverGroup;

      this.viewState = {
        isNew: !policy.ruleID,
        multipleAlarms: false,
        metricsLoaded: false,
        namespacesLoaded: false,
      };

      function createCommand() {
        return {
          application: application.name,
          name: policy.name || '',
          serverGroupName: serverGroup.name,
          credentials: serverGroup.account,
          region: serverGroup.region,
          provider: serverGroup.type,
          scalingPolicyId: policy.ruleID || '',
          adjustmentType: policy.operateUnit,
          minAdjustmentMagnitude: policy.minAdjustmentMagnitude || 1, // ???
          action: policy.action,
          scalingGroupID: policy.scalingGroupID || serverGroup.asg.groupID,
          status: policy.status,
        };
      }

      function initializeAlarm(command, policy) {
        let metricAlarm = policy.triggerObj;
        let statisticObj = {
          last: 'ORIGINAL',
          avg: 'AVERAGE',
          max: 'MAXIMUM',
          min: 'MINIMUM',
        };
        command.alarm = {
          name: metricAlarm.name || '',
          region: serverGroup.region,
          actionsEnabled: true,
          alarmDescription: metricAlarm.alarmDescription, // ???
          comparisonOperator: metricAlarm.comparisonOperator,
          dimensions: metricAlarm.dimensions, // ???
          continuousTime: Number(metricAlarm.evaluationCount),
          period: metricAlarm.period,
          threshold: Number(metricAlarm.threshold),
          namespace: metricAlarm.namespace, // ???
          metricName: metricAlarm.metricName,
          statistic: statisticObj[metricAlarm.statistics] || '', // last,avg,max,min
          unit: metricAlarm.unit, // ???
          alarmActionArns: [],
          insufficientDataActionArns: metricAlarm.insufficientDataActions, // ???
          okActionArns: metricAlarm.okActions, // ???
          cooldown: policy.cooldown,
        };
      }

      this.initialize = () => {
        var command = createCommand();

        initializeAlarm(command, policy);

        let operatorObj = {
          1: 'Add',
          2: 'Remove',
          3: 'Set to',
        };
        // if (command.adjustmentType === 'EXACT_CAPACITY') {
        //   this.viewState.operator = 'Set to';
        //   this.viewState.adjustmentType = 'instances';
        // } else {
        //   let adjustmentBasis = policy.adjustmentValue;
        //   if (policy.stepAdjustments && policy.stepAdjustments.length) {
        //     adjustmentBasis = policy.stepAdjustments[0].adjustmentValue;
        //   }
        //   this.viewState.operator = adjustmentBasis > 0 ? 'Add' : 'Remove';
        //   this.viewState.adjustmentType =
        //     policy.adjustmentType === 'CHANGE_IN_CAPACITY' ? 'instances' : 'percent of group';
        // }

        this.viewState.operator = operatorObj[command.action];
        this.viewState.adjustmentType = command.adjustmentType == 1 ? 'instances' : 'percent of group';

        initializeStepPolicy(command, policy);

        this.command = command;
      };

      function initializeStepPolicy(command, policy) {
        let threshold = command.alarm.threshold;
        command.step = {
          estimatedInstanceWarmup: policy.estimatedInstanceWarmup || command.cooldown || 600,
          metricAggregationType: 'AVERAGE',
        };
        command.step.stepAdjustments = (
          policy.stepAdjustments || [
            {
              adjustmentValue: policy.operateCount,
            },
          ]
        ).map(adjustment => {
          let step = {
            adjustmentValue: Math.abs(adjustment.adjustmentValue),
          };
          step.metricIntervalUpperBound = threshold;
          step.metricIntervalLowerBound = threshold;
          step.threshold = threshold;
          return step;
        });
      }

      this.boundsChanged = () => {
        let source = this.viewState.comparatorBound === 'min' ? 'metricIntervalLowerBound' : 'metricIntervalUpperBound',
          target = source === 'metricIntervalLowerBound' ? 'metricIntervalUpperBound' : 'metricIntervalLowerBound';

        if (this.command.step) {
          let steps = this.command.step.stepAdjustments;
          steps.forEach((step, index) => {
            if (steps.length > index + 1) {
              steps[index + 1][target] = step[source];
            }
          });
          // remove the source boundary from the last step
          delete steps[steps.length - 1][source];
        }
      };

      this.action = this.viewState.isNew ? 'Create' : 'Edit';

      let prepareCommandForSubmit = () => {
        let command = _.cloneDeep(this.command);

        if (command.adjustmentType !== 'PERCENT_CHANGE_IN_CAPACITY') {
          delete command.minAdjustmentMagnitude;
        }

        // if (command.step) {
        //   command.step.stepAdjustments.forEach(step => {
        //     if (this.viewState.operator === 'Remove') {
        //       step.adjustmentValue = 0 - step.adjustmentValue;
        //       delete command.step.estimatedInstanceWarmup;
        //     }
        //     if (step.metricIntervalLowerBound !== undefined) {
        //       step.metricIntervalLowerBound -= command.alarm.threshold;
        //     }
        //     if (step.metricIntervalUpperBound !== undefined) {
        //       step.metricIntervalUpperBound -= command.alarm.threshold;
        //     }
        //   });
        // } else {
        //   if (this.viewState.operator === 'Remove') {
        //     command.simple.adjustmentValue = 0 - command.simple.adjustmentValue;
        //   }
        // }
        let operatorObj = {
          Add: 1,
          Remove: 2,
          'Set to': 3,
        };
        let statisticObj = {
          ORIGINAL: 'last',
          AVERAGE: 'avg',
          MAXIMUM: 'max',
          MINIMUM: 'min',
        };
        return {
          application: command.application,
          accountName: command.credentials,
          credentials: command.credentials,
          region: command.region,
          cloudProvider: 'ctyun',
          serverGroupName: command.serverGroupName,
          operationType: this.viewState.isNew ? 'CREATE' : 'MODIFY',
          scalingPolicyId: command.scalingPolicyId,

          regionID: command.region,
          groupID: command.scalingGroupID,
          ruleID: command.scalingPolicyId || '',
          name: command.name,
          operateUnit: command.adjustmentType == 'CHANGE_IN_CAPACITY' ? 1 : 2,
          operateCount: command.step.stepAdjustments ? command.step.stepAdjustments[0].adjustmentValue : 1,
          action: operatorObj[this.viewState.operator],
          cooldown: command.alarm.cooldown,
          triggerObj: {
            name: command.alarm.name,
            metricName: command.alarm.metricName,
            statistics: statisticObj[command.alarm.statistic],
            comparisonOperator: command.alarm.comparisonOperator,
            threshold: command.alarm.threshold,
            period: command.alarm.period,
            evaluationCount: command.alarm.continuousTime,
          },
        };
      };

      this.taskMonitor = new TaskMonitor({
        application: application,
        title: this.action + ' scaling policy for ' + serverGroup.name,
        modalInstance: $uibModalInstance,
        onTaskComplete: () => application.serverGroups.refresh(),
      });

      this.save = () => {
        let command = prepareCommandForSubmit();
        if (command.name == '') {
          delete command.name;
        }
        if (command.scalingPolicyId == '') {
          delete command.scalingPolicyId;
        }
        if (command.ruleID == '') {
          delete command.ruleID;
        } else {
          command.status = this.command.status;
        }
        if (command.triggerObj.name == '') {
          delete command.triggerObj.name;
        }
        var submitMethod = () => ScalingPolicyWriter.upsertScalingPolicy(application, command);

        this.taskMonitor.submit(submitMethod);
      };

      this.cancel = $uibModalInstance.dismiss;

      this.initialize();
    },
  ]);
