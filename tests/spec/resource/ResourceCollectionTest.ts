///<reference path="../../../typings/vendor.d.ts" />
import sinon = require('sinon');
import _ = require('lodash');
import Runner = require('../../../lib/resource/ResourceCollection');
import ResourceInterface = require('../../../lib/resource/ResourceInterface');
import ResultInterface = require('../../../lib/resource/result/ResultInterface');
import assert = require('assert');

describe('ResourceCollection', () => {

  describe('deploy', () => {
    
    describe('deploying resources', () => {
      var fooService:SinonMock, barService:SinonMock, serviceMap:any;

      beforeEach(() => {
        var resourceServiceStub:ResourceInterface = { deploy: () => <When.Promise<ResultInterface>>{} };

        fooService = sinon.mock(resourceServiceStub);
        barService = sinon.mock(resourceServiceStub);

        serviceMap = {
          Foo: _.identity(fooService),
          Bar: _.identity(barService)
        };
      });
      
      it('should create resources with the provided config', (done) => {
        var FooServiceCtor = Mock('FooService');
        var BarServiceCtor = Mock('BarService');
        FooServiceCtor.returns(fooService);
        BarServiceCtor.returns(barService);

        var runner = new Runner({
          resources: [
            {
              type: 'Foo',
              config: { foo: 'faz' }
            },
            {
              type: 'Bar',
              config: { bar: 'baz' }
            }
          ]
        }, {
          serviceMap: {
            Foo: FooServiceCtor,
            Bar: BarServiceCtor
          }
        });

        FooServiceCtor.once().
          withArgs({ foo: 'faz' });
        BarServiceCtor.once().
          withArgs({ bar: 'baz' });

        runner.deploy().
          done(done, done);

        FooServiceCtor.verify();
        BarServiceCtor.verify();
      });
      
      it('should deploy all configured resources', (done) => {
        var runner = new Runner({
          resources: [
            { type: 'Foo' },
            { type: 'Bar' }
          ]
        }, { serviceMap: serviceMap });

        fooService.expects('run').once();
        barService.expects('run').once();

        runner.deploy()
          .done(done, done);

        fooService.verify();
        barService.verify();
      });

      it('should deploy resources in order', () => {
        var onDeploy = sinon.spy();
        var runner = new Runner({
          resources: [
            { type: 'Foo' },
            { type: 'Bar' }
          ]
        }, { serviceMap: serviceMap });

        fooService['deploy'] = function() {
          // Check that bar service hasn't run yet
          assert(!barService['run'].called, 'Expected fooService.run to have been called ' +
          'before barService.run');

          onDeploy();
        };

        runner.deploy();

        assert(onDeploy.called, "Should have called fooService.deploy");
      });

    });


    
  });

  function Mock(name?:string):SinonExpectation {
    return sinon.expectation.create(name);
  }

});