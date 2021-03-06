///<reference path="../../../../../typings/vendor.d.ts" />
import ResourceConfigInterface = require('../../../config/ResourceConfigInterface');

/**
 * CloudWatch Metric(Alarm) Config
 *
 * @see http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/CloudWatch.html#putMetricAlarm-property
 */
interface CloudWatchMetricConfigInterface extends ResourceConfigInterface {
  region: string;

  name: string;
  description: string;

  /**
   * Namespaces:
   * @see http://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/aws-namespaces.html
   */
  namespace: string;
  /**
   * Metric Names
   * @see http://docs.aws.amazon.com/AmazonCloudWatch/latest/DeveloperGuide/CW_Support_For_AWS.html
   */
  metricName: string;
  dimensions: any[];

  evaluationPeriods: number;
  period: number;
  statistic: string;

  comparisonOperator: string;
  threshold: number;
  unit: string;

  actionsEnabled: boolean;
  alarmActions: string[];
  okActions: string[];
  insufficientDataActions: string[];
}
export = CloudWatchMetricConfigInterface;