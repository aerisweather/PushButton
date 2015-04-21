///<reference path="../../../../../typings/vendor.d.ts" />
import lift = require('../../../../util/lift');
import AWS = require('aws-sdk');
import SQS = AWS.SQS;

class SqsLifted {
  sqs: SQS;

  createQueue:(params:SQS.Params.createQueue) => When.Promise<SQS.Response.createQueue>;
  getQueueUrl:(params:{ QueueName: string }) => When.Promise<{ QueueUrl:string }>;

  constructor(sqsParams = {}) {
    this.sqs = new SQS(sqsParams);

    this.createQueue = lift<SQS.Response.createQueue>(this.sqs.createQueue, this.sqs);
    this.getQueueUrl = lift<{ QueueUrl: string}>(this.sqs.getQueueUrl, this.sqs);
  }

}

export = SqsLifted;