///<reference path="../definitely-typed/node/node.d.ts" />
declare module 'AWS' {
  import fs = require('fs');
  interface Callback<TData> {
    (err:Error, data:TData):void;
  }

  class ElasticBeanstalk {
    constructor(...params:any[]);
    createApplication(...params:any[]):any;
    describeApplications(options:any, callback:{(err:string, data:any[])}):void;
  }

  class S3 {
    public createBucket(params:any, cb?:Callback<any>);
    public deleteBucket(params:any, cb?:Callback<any>);
    public deleteObject(params:any, cb?:Callback<any>);
    public getObject(params:any, cb?:Callback<any>);
    public listBuckets(params:any, cb?:Callback<any>);
    public listObjects(params:any, cb?:Callback<any>);
    public putObject(params:S3.Params.putObject, cb?:Callback<S3.Response.putObject>);
  }

  module S3 {
    module Params {
      interface putObject {
        Bucket: string;
        Key: string;
        Body: fs.ReadStream;
      }
    }

    module Response {
      interface putObject {
        Expiration: string
        ETag: string;
        VersionId: string;
      }
    }
  }

  class SQS {
    public createQueue(params:SQS.Params.createQueue, cb?:Callback<SQS.Response.createQueue>);
    public deleteQueue(params:any, cb?:Callback<any>);
    public getQueueUrl(params:any, cb?:Callback<any>);
    public getQueueAttributes(params:any, cb?:Callback<any>);
    public listQueues(params:any, cb?:Callback<any>);
    public purgeQueue(params:any, cb?:Callback<any>);
    public sendMessage(params:any, cb?:Callback<any>);
    public setQueueAttributes(params:any, cb?:Callback<any>);
  }

  module SQS {

    interface QueueAttributes {
      DelaySeconds?: number;
      MaximumMessageSize?: number;
      MessageRetentionPeriod?: number;
      Policy?: string;
      ReceiveMessageWaitTimeseconds?: string;
      VisibilityTimeout?: string;
    }

    module Params {
      interface createQueue {
        QueueName: string;
        Attributes?: QueueAttributes;
      }
    }

    module Response {
      interface createQueue {
        QueueUrl: string;
      }
    }
  }
}

declare module 'aws-sdk' {
  import AWS = require('AWS');
  export = AWS;
}