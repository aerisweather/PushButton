///<reference path="../definitely-typed/node/node.d.ts" />
declare module AWS {
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
        Body: ReadStream;
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
}

declare module 'aws-sdk' {
  export = AWS;
}