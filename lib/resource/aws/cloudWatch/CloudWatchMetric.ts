///<reference path="../../../../typings/vendor.d.ts" />
import CloudWatchMetricConfig = require('./config/CloudWatchMetricConfigInterface');
import CloudWatchMetricResult = require('./result/CloudWatchMetricResultInterface');
import ResourceInterface = require('../../ResourceInterface');
import _ = require('lodash');
import lift = require('../../../util/lift');
import when = require('when');
import AWS = require('aws-sdk');
import SQS = AWS.SQS;

class CloudWatchMetric implements ResourceInterface {
  protected config:CloudWatchMetricConfig;

  public constructor (config:CloudWatchMetricConfig) {
    this.config = config;
  }

  public getName ():string {
    return this.config.name.replace(/[^a-zA-Z0-9]/g, '').substr(0, 238);
  }

  public getComparisonOperatorString ():string {
    switch (this.config.comparisonOperator.toLowerCase()) {
      case 'greaterthanorequal':
      case 'greaterthanorequalto':
      case 'greaterthanorequaltothreshold':
      case '>=':
        return 'GreaterThanOrEqualToThreshold';
      case 'greaterthan':
      case 'greaterthanthreshold':
      case '>':
        return 'GreaterThanThreshold';
      case 'lessthanorequal':
      case 'lessthanorequalto':
      case 'lessthanorequaltothreshold':
      case '<=':
        return 'LessThanOrEqualToThreshold';
      case 'lessthan':
      case 'lessthanthreshold':
      case '<':
        return 'LessThanThreshold';
      default:
        throw new Error(this.config.comparisonOperator + ' is not a supported comparisonOperator');
    }
  }

  public createResource ():When.Promise<CloudWatchMetricResult> {
    var cloudWatch = new AWS.CloudWatch();
    var putObject = lift<any>(cloudWatch.putMetricAlarm, cloudWatch);

    return cloudWatch.putMetricAlarm({
      AlarmName: this.getName(),
      ComparisonOperator: this.getComparisonOperatorString(),
      EvaluationPeriods: this.config.evaluationPeriods,
      MetricName: this.config.metricName,
      Namespace: this.config.namespace,
      Period: this.config.period,
      Statistic: capitalizeFirstLetter(this.config.statistic),
      Threshold: this.config.threshold,
      ActionsEnabled: this.config.actionsEnabled,
      AlarmActions: this.config.alarmActions,
      AlarmDescription: this.config.description,
      Dimensions: this.config.dimensions,
      InsufficientDataActions: this.config.insufficientDataActions,
      OKActions: this.config.okActions,
      Unit: this.config.unit
    })
      .then((data:AWS.S3.Response.putObject) => {
        return {
          message: 'Successfully created CloudWatchMetric as ' + this.getName()
        };
      });
  }
}

export = CloudWatchMetric;

function capitalizeFirstLetter (string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}