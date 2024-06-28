'use strict';

const angular = require('angular');

import { Subject } from 'rxjs';

import { METRIC_SELECTOR_COMPONENT } from './metricSelector.component';
import { select } from 'd3';

module.exports = angular
  .module('spinnaker.ecloud.serverGroup.details.scalingPolicy.alarm.configurer', [
    require('./dimensionsEditor.component').name,
    METRIC_SELECTOR_COMPONENT,
  ])
  .component('ecloudAlarmConfigurer', {
    bindings: {
      command: '=',
      modalViewState: '=',
      serverGroup: '<',
      boundsChanged: '&',
    },
    templateUrl: require('./alarmConfigurer.component.html'),
    controller: function() {
      this.statistics = ['AVERAGE', 'MAXIMUM', 'MINIMUM'];
      this.state = {
        units: null,
      };

      this.comparators = [
        { label: '增加', value: 'add' },
        { label: '减少', value: 'reduce' },
        { label: '调整至', value: 'adjustTo' },
      ];

      this.periods = [
        { label: '台', value: 'unit' },
        { label: '%', value: '%' }
      ];

      this.alarmUpdated = new Subject();

      this.thresholdChanged = () => {
        // let source =
        //   this.modalViewState.comparatorBound === 'max' ? 'metricIntervalLowerBound' : 'metricIntervalUpperBound';
        // if (this.command.step) {
        //   // always set the first step at the alarm threshold
        //   this.command.step.stepAdjustments[0][source] = this.command.alarm.threshold;
        // }
        
        const { alarm } = this.command;
        if(alarm.period && alarm.comparisonOperator && alarm.adjustmentValue){
          if(alarm.comparisonOperator === 'adjustTo'){
            this.command.alarm.period = 'unit';
            this.command.adjustmentType = 'TOTAL_CAPACITY';
          }else if(alarm.comparisonOperator != 'adjustTo'){
            if(alarm.comparisonOperator === 'add' && alarm.period === '%'){
              this.command.adjustmentType = 'PERCENT_CHANGE_IN_CAPACITY';
            }else if(alarm.comparisonOperator === 'reduce' && alarm.period === 'unit'){
              this.command.adjustmentType = 'QUANTITY_CHANGE_IN_CAPACITY';
              this.command.adjustmentValue = alarm.adjustmentValue * -1;
            }
          }
        }
        this.command.minAdjustmentValue = alarm.minAdjustmentValue;
        this.command.cooldown = alarm.cooldown;
        this.command.policyName = alarm.policyName;
        this.command.adjustmentValue = alarm.adjustmentValue;
  
        this.boundsChanged();
        this.alarmUpdated.next();
      };

      this.updateChart = () => this.alarmUpdated.next();

      this.alarmComparatorChanged = () => {
        let previousComparatorBound = this.modalViewState.comparatorBound;
        this.modalViewState.comparatorBound =
          this.command.alarm.comparisonOperator.indexOf('GREATER') === 0 ? 'max' : 'min';
        if (
          previousComparatorBound &&
          this.modalViewState.comparatorBound !== previousComparatorBound &&
          this.command.step
        ) {
          this.command.step.stepAdjustments = [{ adjustmentValue: 1 }];
          this.thresholdChanged();
        }
        this.alarmUpdated.next();
      };

      this.$onInit = () => {
        this.alarm = this.command.alarm;
        this.alarmComparatorChanged();
      };
    },
  });
