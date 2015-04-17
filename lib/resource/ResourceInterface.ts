///<reference path="../../typings/vendor.d.ts" />
import ResultInterface = require('./result/ResultInterface');

interface ResourceInterface {
  deploy():ResultInterface;
}
export = ResourceInterface;