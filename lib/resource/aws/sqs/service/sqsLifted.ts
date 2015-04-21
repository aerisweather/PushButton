///<reference path="../../../../../typings/vendor.d.ts" />
import lift = require('../../../../util/lift');
import AWS = require('aws-sdk');
import SQS = AWS.SQS;

interface SqsLifted {
  createQueue(params:SQS.Params.createQueue):When.Promise<SQS.Response.createQueue>;
  getQueueUrl(params:{ QueueName: string }):When.Promise<{ QueueUrl:string }>;
}

var sqsProxy = new SQS();
var sqsLifted:SqsLifted = {
  createQueue: lift<SQS.Response.createQueue>(sqsProxy.createQueue, sqsProxy),
  getQueueUrl: lift<{ QueueUrl: string}>(sqsProxy.getQueueUrl, sqsProxy)
};

export = sqsLifted;