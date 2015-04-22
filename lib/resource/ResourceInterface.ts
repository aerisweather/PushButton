///<reference path="../../typings/vendor.d.ts" />
import ResultInterface = require('./result/ResultInterface');

interface ResourceInterface {
  createResource():When.Promise<ResultInterface>;
}
export = ResourceInterface;