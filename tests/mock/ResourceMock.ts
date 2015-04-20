///<reference path="../../typings/vendor.d.ts" />
import ResourceInterface = require('../../lib/resource/ResourceInterface');

class ResourceMock implements ResourceInterface {
  public deploy:SinonSpy;
  public config:any;

  public constructor(config?:any) {
    this.deploy = sinon.spy();
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