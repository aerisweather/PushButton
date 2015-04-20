///<reference path="../../typings/vendor.d.ts" />
import ResultInterface = require('./result/ResultInterface');
import when = require('when');

interface ResourceInterface {
  deploy():when.Promise<ResultInterface>;
}
export = ResourceInterface;