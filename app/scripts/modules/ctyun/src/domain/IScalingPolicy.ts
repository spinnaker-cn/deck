export interface IScalingPolicyAlarm {
  alarmName?: string;
  alarmArn?: string;
  metricName: string;
  statistic?: AlarmStatisticType;
  statistics?: AlarmStatisticType;
  period: String;
  threshold: number;
  comparisonOperator: AlarmComparisonOperator;
  okactions?: string[];
  insufficientDataActions?: string[];
  alarmActions?: string[];
  continuousTime?: number;
  alarmDescription?: string;
  unit?: StandardUnitType;
  evaluationCount?: number;
}

export type ScalingPolicyAdjustmentType = 'CHANGE_IN_CAPACITY' | 'EXACT_CAPACITY' | 'PERCENT_CHANGE_IN_CAPACITY';

export type MetricAggregationType = 'MINIMUM' | 'MAXIMUM' | 'AVERAGE';

export type AlarmComparisonOperator =
  | 'GREATER_THAN_OR_EQUAL_TO'
  | 'GREATER_THAN'
  | 'LESS_THAN_OR_EQUAL_TO'
  | 'LESS_THAN'
  | 'eq'
  | 'gt'
  | 'ge'
  | 'lt'
  | 'le';

export type AlarmStatisticType =
  | 'SampleCount'
  | 'AVERAGE'
  | 'Sum'
  | 'MINIMUM'
  | 'MAXIMUM'
  | 'last'
  | 'avg'
  | 'max'
  | 'min';

export type StandardUnitType =
  | 'Seconds'
  | 'Microseconds'
  | 'Milliseconds'
  | 'Bytes'
  | 'Kilobytes'
  | 'Megabytes'
  | 'Gigabytes'
  | 'Terabytes'
  | 'Bits'
  | 'Kilobits'
  | 'Megabits'
  | 'Gigabits'
  | 'Terabits'
  | 'Percent'
  | 'Count'
  | 'BytesSecond'
  | 'KilobytesSecond'
  | 'MegabytesSecond'
  | 'GigabytesSecond'
  | 'TerabytesSecond'
  | 'BitsSecond'
  | 'KilobitsSecond'
  | 'MegabitsSecond'
  | 'GigabitsSecond'
  | 'TerabitsSecond'
  | 'CountSecond'
  | 'None';

export interface IStepAdjustment {
  metricIntervalLowerBound?: number;
  metricIntervalUpperBound?: number;
  adjustmentValue?: number;
}

export interface IScalingPolicy {
  scalingGroupID?: number;
  policyARN?: string;
  policyName?: string;
  name?: string;
  ruleID?: number;
  policyType?: string;
  adjustmentType?: ScalingPolicyAdjustmentType;
  metricAlarm?: IScalingPolicyAlarm;
  triggerObj?: IScalingPolicyAlarm;
  autoScalingPolicyId?: string;
  stepAdjustments?: IStepAdjustment[]; // step
  metricAggregationType?: MetricAggregationType; // step
  estimatedInstanceWarmup?: number; // step

  minAdjustmentStep?: number; // simple
  cooldown?: number; // simple
  minAdjustmentMagnitude?: number; // simple
  adjustmentValue?: number; // simple

  action?: number;
  operateUnit?: number;
  ruleType?: number;
}
