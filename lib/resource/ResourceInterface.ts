///<reference path="../../typings/vendor.d.ts" />
import ResultInterface = require('./result/ResultInterface');

interface ResourceInterface {
  deploy():When.Promise<ResultInterface>;
}
export = ResourceInterface;