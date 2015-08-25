///<reference path="../definitely-typed/node/node.d.ts" />
declare module 'AWS' {
	import fs = require('fs');
	interface Callback<TData> {
		(err:Error, data:TData):void;
	}

	class CloudWatch {
		public constructor (params?:{ region: string });
		public putMetricAlarm (params:any, cb?:Callback<any>);
	}

	class ElasticBeanstalk {
		constructor (...params:any[]);
		createApplication (...params:any[]):any;
		createEnvironment (params:ElasticBeanstalk.Params.createEnvironment, cb:Callback<any>);
		createApplicationVersion (...params:any[]):any;
		describeApplications (options:any, callback:Callback<any>):void;
		describeEnvironments (params:any[], callback:Callback<any>):void;
		describeEnvironmentOptions(params:any[], callback:Callback<any>):void;
		describeEnvironmentResources(params:any[], callback:Callback<any>):void;
		listAvailableSolutionStacks (callback:Callback<any>);
    updateEnvironment(params:any, callback:Callback<any>);
	}

	module ElasticBeanstalk {
		module Params {
			interface createEnvironment {
				ApplicationName: string;
				EnvironmentName: string;
				CNAMEPrefix?: string;
				Description?: string;
				OptionSettings?: {
					Namespace: string;
					OptionName: string;
					Value: string;
				}[];
				OptionsToRemove?: {
					Namespace: string;
					OptionName: string;
				}[];
				SolutionStackName?: string;
				Tags?: {
					Key: string;
					Value: string;
				}[];
				TemplateName?: string;
				Tier?: {
					Name: string;
					Type: string;
					Version: string;
				};
				VersionLabel?: string;
			}
		}
	}

	class S3 {
		public createBucket (params:any, cb?:Callback<any>);
		public deleteBucket (params:any, cb?:Callback<any>);
		public deleteObject (params:any, cb?:Callback<any>);
		public getObject (params:any, cb?:Callback<any>);
		public listBuckets (params:any, cb?:Callback<any>);
		public listObjects (params:any, cb?:Callback<any>);
		public putObject (params:S3.Params.putObject, cb?:Callback<S3.Response.putObject>);
    public upload(params:S3.Params.ObjectDescription, cb?:Callback<any>):S3.ManagedUpload;
	}

	module S3 {
		module Params {
      interface ObjectDescription {
        Bucket: string;
        Key: string;
        Body: fs.ReadStream;
      }

      interface putObject extends ObjectDescription {
			}
		}

		module Response {
			interface putObject {
				Expiration: string
				ETag: string;
				VersionId: string;
			}
		}

    export interface ManagedUpload extends NodeJS.EventEmitter {
      abort():void;
      send(cb:Callback<any>):void;
    }
	}

	class SQS {
		public constructor (params?:{ region: string });
    public addPermission(params:{
      AWSAccountIds: string[];
      Actions: string[];
      Label: string;
      QueueUrl: string;
    }, cb?:Callback<any>);
		public createQueue (params:SQS.Params.createQueue, cb?:Callback<SQS.Response.createQueue>);
		public deleteQueue (params:any, cb?:Callback<any>);
		public getQueueUrl (params:any, cb?:Callback<any>);
		public getQueueAttributes (params:any, cb?:Callback<any>);
		public listQueues (params:any, cb?:Callback<any>);
		public purgeQueue (params:any, cb?:Callback<any>);
		public sendMessage (params:any, cb?:Callback<any>);
		public setQueueAttributes (params:{
      QueueUrl: string;
      Attributes: SQS.QueueAttributes;
    }, cb?:Callback<any>);
    public getQueueAttributes(params: {
      QueueUrl: string;
      AttributeNames: string[];
    }, cb?:Callback<any>);
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

		interface Policy {
			Statement:any;
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

    interface Policy {
      Id: string;
      Statement: PolicyStatement[];
    }

    interface PolicyStatement {
      Effect: string;
      Action: string;
      Principal: {
        AWS: string;
      };
      Resource: string;
    }
	}

  export interface Request extends NodeJS.EventEmitter {

  }
}

declare module 'aws-sdk' {
	import AWS = require('AWS');
	export = AWS;
}