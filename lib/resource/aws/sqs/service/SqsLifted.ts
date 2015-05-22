///<reference path="../../../../../typings/vendor.d.ts" />
import lift = require('../../../../util/lift');
import AWS = require('aws-sdk');
import SQS = AWS.SQS;

class SqsLifted {
  sqs:SQS;

  public createQueue:(params:SQS.Params.createQueue) => When.Promise<SQS.Response.createQueue>;
  public getQueueUrl:(params:{ QueueName: string }) => When.Promise<{ QueueUrl:string }>;
  public addPermission:(params:{
    AWSAccountIds: string[];
    Actions: string[];
    Label: string;
    QueueUrl: string;
  }, cb?:Function) => When.Promise<any>;
  public setQueueAttributes:(params:{
    QueueUrl: string;
    Attributes: SQS.QueueAttributes;
  }) => When.Promise<any>;
  public getQueueAttributes:(params:{
    QueueUrl: string;
    AttributeNames: string[];   // keys of
  }) => When.Promise<{
    ResponseMetaData: any;
    Attributes: any;
  }>;

  constructor(sqsParams?:{ region: string }) {
    this.sqs = new SQS(sqsParams);

    [
      'createQueue',
      'getQueueUrl',
      'addPermission',
      'setQueueAttributes',
      'getQueueAttributes'
    ].forEach(method => this.liftSqsMethod(method));
  }

  protected liftSqsMethod(method) {
    this[method] = lift<any>(this.sqs[method], this.sqs);
  }

}

export = SqsLifted;