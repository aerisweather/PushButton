///<reference path="../../../../typings/vendor.d.ts" />
import SqsQueueConfig = require('./config/SqsQueueConfigInterface');
import SqsQueueResult = require('./result/SqsQueueResultInterface');
import ResourceInterface = require('../../ResourceInterface');
import _ = require('lodash');
import when = require('when');
import WhenKeys = require('when/keys');
import SqsLifted = require('./service/SqsLifted');
import AWS = require('aws-sdk');
import SQS = AWS.SQS;
import Logger = require('../../../util/Logger');

class SqsQueue implements ResourceInterface {
  protected config:SqsQueueConfig;
  protected sqs:SqsLifted;

  public constructor(config:SqsQueueConfig) {
    this.config = config;
    this.sqs = new SqsLifted({region: config.region});
  }

  public createResource():When.Promise<SqsQueueResult> {
    var params = {
      QueueName: this.config.queueName,
      Attributes: this.config.attributes || {}
    };

    Logger.trace('Creating SQS queue with params: ' + JSON.stringify(params, null, 2));

    return this.sqs.createQueue(params).
      then((data:SQS.Response.createQueue):SqsQueueResult => {
        this.queueUrl = data.QueueUrl;
        return {
          message: 'Successfully created queue "{QUEUE_NAME}" at {QUEUE_URL}'.
            replace('{QUEUE_NAME}', this.config.queueName).
            replace('{QUEUE_URL}', data.QueueUrl),
          queueName: this.config.queueName,
          queueUrl: data.QueueUrl
        };
      });
  }

  get queueUrl() {
    return this.config.queueUrl;
  }

  set queueUrl(queueUrl:string) {
    this.config.queueUrl = queueUrl;
  }

  public getQueueUrl():When.Promise<string> {
    if (this.queueUrl !== null) {
      return when(this.queueUrl);
    }

    return this.sqs.
      getQueueUrl({
        QueueName: this.config.queueName
      }).
      then((data) => data.QueueUrl).
      tap((queueUrl) => this.queueUrl = queueUrl);
  }

  public addPermission(permission:{ principals: string[]; actions: string[]; label?: string; }):When.Promise<any> {
    return this.getQueueUrl().
      then((queueUrl) => {
        return this.sqs.addPermission({
          AWSAccountIds: permission.principals,
          Actions: permission.actions,
          Label: permission.label || _.uniqueId('QUEUE_PERMISSION_'),
          QueueUrl: queueUrl
        });
      });
  }

  public setPolicy(policy:any) {
    return WhenKeys.
      all({
        policy: this.normalizePolicy(policy),
        queueUrl: this.getQueueUrl()
      }).
      tap(res => Logger.trace('SQS: setting policy ' + Logger.pp(res.policy))).
      then(res => ({
        QueueUrl: res.queueUrl,
        Attributes: {
          Policy: JSON.stringify(policy)
        }
      })).
      tap(attrs => Logger.trace('SQS: Setting attributes ' + Logger.pp(attrs))).
      then(attrs => this.sqs.setQueueAttributes(attrs)).
      tap(() => Logger.trace('SQS: Setting attributes complete.'));
  }

  protected normalizePolicy(policy:SQS.Policy):When.Promise<SQS.Policy> {
    return this.getQueueArn().
      then(arn => <SQS.Policy> _.defaults(policy, {
        Id: _.uniqueId('sqs_policy_'),
        Statement: policy.Statement.
          map(stmt => _.defaults(stmt, {
            // Use the queue arn as the policy resource
            Resource: arn
          }))
      }));
  }

  public getQueueArn() {
    Logger.trace('SQS: getting Queue ARN');
    return this.getQueueUrl().
      then(queueUrl => this.sqs.getQueueAttributes({
        QueueUrl: queueUrl,
        AttributeNames: ['QueueArn']
      })).
      then(res => res.Attributes['QueueArn']).
      tap(arn => Logger.trace('SQS: Queue ARN is ' + arn));
  }

}
export = SqsQueue;