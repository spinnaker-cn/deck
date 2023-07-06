import { IComponentOptions, module } from 'angular';

const scalingPolicyPopover: IComponentOptions = {
  bindings: {
    policy: '=',
    serverGroup: '=',
  },
  templateUrl: require('./scalingPolicyPopover.component.html'),
  controller() {
    this.$onInit = () => {
      this.alarm = this.policy.triggerObj;

      let showWait = false;
      if (this.policy.cooldown) {
        showWait = true;
      }
      if (this.policy.stepAdjustments && this.policy.stepAdjustments.length) {
        showWait = this.policy.stepAdjustments[0].operator !== 'decrease';
      }
      this.showWait = showWait;

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
      this.getWeek = (weekList: Number[]) => {
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
    };
  },
};

export const SCALING_POLICY_POPOVER = 'spinnaker.ctyun.serverGroup.details.scalingPolicy.popover.component';
module(SCALING_POLICY_POPOVER, [require('../chart/metricAlarmChart.component').name]).component(
  'ctyunScalingPolicyPopover',
  scalingPolicyPopover,
);
