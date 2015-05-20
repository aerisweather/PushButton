///<reference path="../../../../typings/vendor.d.ts" />
import SqsQueueConfig = require('./config/SqsQueueConfigInterface');
import SqsQueueResult = require('./result/SqsQueueResultInterface');
import ResourceInterface = require('../../ResourceInterface');
import _ = require('lodash');
import when = require('when');
import SqsLifted = require('./service/SqsLifted');
import AWS = require('aws-sdk');
import SQS = AWS.SQS;

class SqsQueue implements ResourceInterface {
  protected config:SqsQueueConfig;
  protected sqs:SqsLifted;

  public constructor(config:SqsQueueConfig) {
    this.config = config;
    this.sqs = new SqsLifted({ region: config.region });
  }

  public createResource():When.Promise<SqsQueueResult> {
    return this.sqs.createQueue({
      QueueName: this.config.queueName,
      Attributes: this.config.attributes || {}
    }).
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

  public addPermission(permission: { principals: string[]; actions: string[]; label?: string; }):When.Promise<any> {
    return this.getQueueUrl().
      then((queueUrl) => {
        return this.sqs.addPermission({
          AWSAccountIds: permission.principals,
          Actions: permission.actions,
          Label: permission.label ||   _.uniqueId('QUEUE_PERMISSION_'),
          QueueUrl: queueUrl
        });
      });
  }

}
export = SqsQueue;