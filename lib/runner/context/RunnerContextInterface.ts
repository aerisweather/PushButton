///<reference path="../../../typings/vendor.d.ts" />
import ResourceInterface = require('../../resource/ResourceInterface');

interface RunnerContextInterface extends Wire.Context {
  params:any;
  resources:ResourceInterface[];
}
export = RunnerContextInterface;