import ResourceConfigInterface = require('../../resource/config/ResourceConfigInterface');

interface RunnerConfigInterface {
  params?:any;
  resources:ResourceConfigInterface[];
}
export = RunnerConfigInterface;