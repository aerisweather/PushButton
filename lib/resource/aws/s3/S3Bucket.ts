///<reference path="../../../../typings/vendor.d.ts" />
import ResourceInterface = require('../../ResourceInterface');
import when = require('when');
import BucketResult = require('./result/S3BucketResultInterface');
import BucketConfig = require('./config/S3BucketConfigInterface');
import lift = require('../../../util/lift');
import AWS = require('aws-sdk');

class S3Bucket implements ResourceInterface {
  protected config:BucketConfig;

  public constructor(config:BucketConfig) {
    this.config = config;
  }

  /** Return the name of the S3 Bucket */
  public getBucketName() {
    return this.config.bucketName;
  }

  public createResource():When.Promise<BucketResult> {
    return when({
      message: 'Bucket.deploy is not yet implemented'
    }).tap(() => {
      throw new Error('Bucket.deploy is not yet implemented');
    });
  }

}
export = S3Bucket;