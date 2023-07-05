'use strict';

const angular = require('angular');

import { Subject } from 'rxjs';

import { METRIC_SELECTOR_COMPONENT } from './metricSelector.component';

module.exports = angular
  .module('spinnaker.ctyun.serverGroup.details.scalingPolicy.alarm.configurer', [
    require('./dimensionsEditor.component').name,
    METRIC_SELECTOR_COMPONENT,
  ])
  .component('ctyunAlarmConfigurer', {
    bindings: {
      command: '=',
      modalViewState: '=',
      serverGroup: '<',
      boundsChanged: '&',
    },
    templateUrl: require('./alarmConfigurer.component.html'),
    controller: function() {
      this.statistics = ['ORIGINAL', 'AVERAGE', 'MAXIMUM', 'MINIMUM'];
      this.state = {
        units: null,
      };

      this.comparators = [
        { label: '>=', value: 'ge' },
        { label: '>', value: 'gt' },
        { label: '<=', value: 'le' },
        { label: '<', value: 'lt' },
        { label: '=', value: 'eq' },
      ];

      this.periods = [
        { label: '1 minute', value: '1m' },
        { label: '5 minutes', value: '5m' },
        { label: '20 minutes', value: '20m' },
        { label: '1 hour', value: '1h' },
        { label: '4 hours', value: '4h' },
        { label: '1 day', value: '24h' },
      ];

      this.metricNamesUnit = {
        cpu_util: '%',
        mem_util: '%',
        net_in_bytes_rate: 'KBps',
        net_out_bytes_rate: 'KBps',
        disk_write_bytes_rate: 'KBps',
        disk_read_bytes_rate: 'KBps',
        disk_read_requests_rate: 'IOPS',
        disk_write_requests_rate: 'IOPS',
      };

      this.alarmUpdated = new Subject();

      this.thresholdChanged = () => {
        if (this.command.step) {
          // always set the first step at the alarm threshold
          this.command.step.stepAdjustments[0]['threshold'] = this.command.alarm.threshold;
        }
        this.boundsChanged();
        this.alarmUpdated.next();
      };

      this.updateChart = () => this.alarmUpdated.next();

      this.alarmComparatorChanged = () => {
        let previousComparatorBound = this.modalViewState.comparatorBound;
        this.modalViewState.comparatorBound = this.command.alarm.comparisonOperator.indexOf('g') === 0 ? 'max' : 'min';
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
