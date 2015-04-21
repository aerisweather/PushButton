///<reference path="../../typings/vendor.d.ts" />
import sinon = require('sinon');
import when = require('when');
import ResourceInterface = require('../../lib/resource/ResourceInterface');

class ResourceMock implements ResourceInterface {
  public deploy:SinonExpectation;
  public config:any;

  public constructor(config:any = {}) {
    this.deploy = sinon.expectation.create('deploy');
    this.deploy.returns(when(config.result || {}));
    this.config = config;
  }

  public getCtorMock() {
    return (config) => {
      this.constructor(config);
      return this;
    }
  }
}
export = ResourceMock;