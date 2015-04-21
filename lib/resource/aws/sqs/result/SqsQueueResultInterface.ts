///<reference path="../../../../../typings/vendor.d.ts" />
import ResultInterface = require('../../../result/ResultInterface');

interface SqsQueueResultInterface extends ResultInterface{
  queueName: string;
  queueUrl: string;
}
export = SqsQueueResultInterface;