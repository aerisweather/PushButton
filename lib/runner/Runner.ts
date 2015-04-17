/// <reference path="../../typings/vendor.d.ts" />
import when = require('when');
import RunnerConfigInterface = require('./config/RunnerConfigInterface');
import RunnerOptions = require('./options/RunnerOptionsInterface');

class Runner {
  config:RunnerConfigInterface;

  constructor(config:RunnerConfigInterface, options?:RunnerOptions) {
    this.config = config;
  }

  public deploy():when.Promise<any> {
    return when({});
  }
}

export = Runner;
