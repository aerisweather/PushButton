///<reference path="../../../typings/vendor.d.ts" />
import ResultInterface = require('./ResultInterface');

interface ResourceCollectionResultInterface extends ResultInterface{
  results: ResultInterface[];
}
export = ResourceCollectionResultInterface;