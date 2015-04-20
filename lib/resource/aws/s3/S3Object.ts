///<reference path="../../../../typings/vendor.d.ts" />
import ResourceInterface = require('../../ResourceInterface');
import when = require('when');
import ObjectResult = require('./result/ObjectResultInterface');
import ObjectConfig = require('./config/ObjectConfigInterface');
import Bucket = require('./Bucket');
import lift = require('../../../util/lift');
import AWS = require('aws-sdk');
import fs = require('fs');

class S3Object implements ResourceInterface {
  protected config:ObjectConfig;

  public constructor(config:ObjectConfig) {
    this.config = config;
  }

  public deploy():When.Promise<ObjectResult> {
    var s3 = new AWS.S3();
    var putObject = lift<any>(s3.putObject, s3);

    return this.getFileStream().
      then((fileStream) => {
        return putObject({
          Bucket: this.getBucket().getName(),
          Key: this.config.key,
          Body: fileStream
        });
      }).
      then((data:AWS.S3.Response.putObject) => {
        return {
          message: 'Succesfully uploaded S3 Object to ' + this.getUrl()
        };
      });
  }

  public getUrl() {
    // There's gotta be a safer way to get the actual object URL
    // using the S3 api, but I can't find it in the docs....
    return 'https://s3.amazonaws.com/{BUCKET_NAME}/{OBJECT_KEY}'.
      replace('{BUCKET_NAME}', this.getBucket().getName()).
      replace('{OBJECT_KEY}', this.config.key);
  }

  protected getFileStream():When.Promise<fs.ReadStream> {
    return this.config.fileProvider.
      deploy().
      then((result) => result.fileStream);
  }

  public getBucket():Bucket {
    return this.config.bucket;
  }

}
export = S3Object;