///<reference path="../../../../typings/vendor.d.ts" />
import ResourceInterface = require('../../ResourceInterface');
import when = require('when');
import ObjectResult = require('./result/S3ObjectResultInterface');
import ObjectConfig = require('./config/S3ObjectConfigInterface');
import SourceBundle = require('../elasticbeanstalk/SourceBundleInterface');
import Bucket = require('./S3Bucket');
import lift = require('../../../util/lift');
import AWS = require('aws-sdk');
import fs = require('fs');
import Logger = require('../../../util/Logger');
import _ = require('lodash');

class S3Object implements ResourceInterface {
	protected config:ObjectConfig;

	public constructor (config:ObjectConfig) {
		this.config = config;
	}

	public createResource ():When.Promise<ObjectResult> {

		return this.getFileStream().
			then((fileStream) => {
        var s3 = new AWS.S3();
        var objectParams = {
          Bucket: this.getBucket().getBucketName(),
          Key: this.config.key,
          Body: fileStream
        };
        var managedUpload = s3.upload(objectParams);
        var sendUpload = lift<any>(managedUpload.send, managedUpload);
        var objectPath = 's3:/' + '/' + [objectParams.Bucket, objectParams.Key].join('/');

        Logger.trace('S3: Uploading to ' + objectPath + '...');

        let logProgress = _.throttle((progress:{loaded:number; total?:number;}) => {
          Logger.trace(progress.loaded + ' out of ' + progress.total + ' bytes uploaded...');
        }, 500);

        managedUpload.on('httpUploadProgress', logProgress);

        return sendUpload();
			}).
      tap(() => Logger.trace('S3: Upload complete')).
			then((data:AWS.S3.Response.putObject) => {
				return {
					message: 'Succesfully uploaded S3 Object to ' + this.getUrl()
				};
			});
	}

	public getUrl ():string {
		// There's gotta be a safer way to get the actual object URL
		// using the S3 api, but I can't find it in the docs....
		return 'https://s3.amazonaws.com/{BUCKET_NAME}/{OBJECT_KEY}'.
			replace('{BUCKET_NAME}', this.getBucket().getBucketName()).
			replace('{OBJECT_KEY}', this.config.key);
	}

	public getKey ():string {
		return this.config.key;
	}

	public getSourceBundle ():SourceBundle {
		return {
			S3Bucket: this.getBucket().getBucketName(),
			S3Key: this.getKey()
		};
	}

	protected getFileStream ():When.Promise<fs.ReadStream> {
		return this.config.fileProvider.
			createResource().
			then((result) => result.fileStream);
	}

	public getBucket ():Bucket {
		return this.config.bucket;
	}

}
export = S3Object;