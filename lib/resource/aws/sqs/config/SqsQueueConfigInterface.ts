///<reference path="../../../../../typings/vendor.d.ts" />
import ResourceConfigInterface = require('../../../config/ResourceConfigInterface');
import AWS = require('aws-sdk');

interface SqsQueueConfigInterface extends ResourceConfigInterface {
  region: string;
  queueName?: string;
  queueUrl?: string;
  /** Attributes to pass to SQS.createQueue */
  attributes?: AWS.SQS.QueueAttributes;
}
export = SqsQueueConfigInterface;