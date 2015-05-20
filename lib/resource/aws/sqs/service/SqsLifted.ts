///<reference path="../../../../../typings/vendor.d.ts" />
import lift = require('../../../../util/lift');
import AWS = require('aws-sdk');
import SQS = AWS.SQS;

class SqsLifted {
  sqs: SQS;

  public createQueue:(params:SQS.Params.createQueue) => When.Promise<SQS.Response.createQueue>;
  public getQueueUrl:(params:{ QueueName: string }) => When.Promise<{ QueueUrl:string }>;
  public addPermission(params:{
    AWSAccountIds: string[];
    Actions: string[];
    Label: string;
    QueueUrl: string;
  }, cb?:Callback<any>);

  constructor(sqsParams?:{ region: string }) {
    this.sqs = new SQS(sqsParams);

    this.createQueue = lift<SQS.Response.createQueue>(this.sqs.createQueue, this.sqs);
    this.getQueueUrl = lift<{ QueueUrl: string}>(this.sqs.getQueueUrl, this.sqs);
    this.addPermission = lift<{
      AWSAccountIds: string[];
      Actions: string[];
      Label: string;
      QueueUrl: string;
    }>(this.sqs.addPermission, this.sqs);
  }

}

export = SqsLifted;