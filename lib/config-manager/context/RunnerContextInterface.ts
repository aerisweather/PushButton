///<reference path="../../../typings/vendor.d.ts" />
import ResourceInterface = require('../../resource/ResourceInterface');
import ResultInterface = require('../../resource/result/ResultInterface');

interface RunnerContextInterface extends Wire.Context {
  params:any;
  resources:ResourceInterface[];
  results:any;
}
export = RunnerContextInterface;