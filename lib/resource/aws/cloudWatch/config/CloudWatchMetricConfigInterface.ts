///<reference path="../../../../../typings/vendor.d.ts" />
import ResourceConfigInterface = require('../../../config/ResourceConfigInterface');

interface CloudWatchMetricConfigInterface extends ResourceConfigInterface {
  name: string;
  description: string;
  comparisonOperator: string;
  evaluationPeriods: number;
  metricName: string;
  namespace: string;
  period: number;
  statistic: string;
  threshold: number;
  unit: string;
  actionsEnabled: boolean;
  alarmActions: string[];
  dimensions: any[];
  insufficientDataActions: string[];
  okActions: string[];
}
export = CloudWatchMetricConfigInterface;