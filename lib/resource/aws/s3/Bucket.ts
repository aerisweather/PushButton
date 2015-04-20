///<reference path="../../../../typings/vendor.d.ts" />
import ResourceInterface = require('../../ResourceInterface');
import when = require('when');
import BucketResult = require('./result/BucketResultInterface');
import BucketConfig = require('./config/BucketConfigInterface');
import lift = require('../../../util/lift');
import AWS = require('aws-sdk');

class Bucket implements ResourceInterface {
  protected config:BucketConfig;

  public constructor(config:BucketConfig) {
    this.config = config;
  }

  /** Return the name of the S3 Bucket */
  public getName() {
    return this.config.name;
  }

  public deploy():When.Promise<BucketResult> {
    return when({
      message: 'Bucket.deploy is not yet implemented'
    }).tap(() => {
      throw new Error('Bucket.deploy is not yet implemented');
    });
  }

}
export = Bucket;