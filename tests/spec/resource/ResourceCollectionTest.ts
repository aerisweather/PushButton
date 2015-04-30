///<reference path="../../../typings/vendor.d.ts" />
import sinon = require('sinon');
import when = require('when');
import _ = require('lodash');
import ResourceCollection = require('../../../lib/resource/ResourceCollection');
import ResourceCollectionResult = require('../../../lib/resource/result/ResourceCollectionResultInterface');
import ConfigManager = require('../../../lib/config-manager/ConfigManager');
import ResourceInterface = require('../../../lib/resource/ResourceInterface');
import ResultInterface = require('../../../lib/resource/result/ResultInterface');
import ResourceMock = require('../../mock/ResourceMock');
import assert = require('assert');
import fs = require('fs-extra');
import path = require('path');

describe('ResourceCollection', () => {


  describe('deploying resources', () => {
    var fooService:ResourceMock, barService:ResourceMock, configManager;

    beforeEach(() => {
      fooService = new ResourceMock();
      barService = new ResourceMock();

      configManager = new ConfigManager();
      configManager.setResourceMap({
        Foo: fooService.getCtorMock(),
        Bar: barService.getCtorMock()
      });
    });

    it('should deploy all configured resources', (done) => {
      var resourceCollection = new ResourceCollection({
        resources: [
          {
            name: 'fooService',
            type: 'Foo',
            actions: ['createResource'],
            config: {}
          },
          {
            name: 'barService',
            type: 'Bar',
            actions: ['createResource'],
            config: {}
          }
        ]
      });
      resourceCollection.setConfigManager(configManager);

      resourceCollection.createResource().
        then(() => {
          assert(fooService.createResource.called, "Should have deployed fooService");
          assert(barService.createResource.called, "Should have deployed barService");
        }).
        done(() => done(), done);
    });

    it('should wire param references in resources', (done) => {
      var resourceCollection = new ResourceCollection({
        params: {
          foo: 'bar'
        },
        resources: [
          {
            name: 'fooService',
            type: 'Foo',
            actions: ['createResource'],
            config: {
              foo: { $ref: 'params.foo' }
            }
          }
        ]
      });
      resourceCollection.setConfigManager(configManager);

      resourceCollection.createResource().
        then(() => {
          assert.equal(fooService.config['foo'], 'bar');
        }).
        done(() => done(), done);
    });
    
    it('should import params', (done) => {
      var tmpFile = path.join(process.cwd(), 'paramsConfig.json');
      var resourceCollection;


      fs.outputJsonSync(tmpFile, {
        params: {
          foo: 'bar'
        },
        resources: []
      });

      resourceCollection = new ResourceCollection({
        imports: [
          './paramsConfig.json'
        ],
        resources: [
          {
            name: 'fooService',
            type: 'Foo',
            actions: ['createResource'],
            config: {
              foo: { $ref: 'params.foo' }
            }
          }
        ]
      });
      resourceCollection.setConfigManager(configManager);

      resourceCollection.createResource().
        then(() => {
          assert.equal(fooService.config['foo'], 'bar');
        }).
        finally(() => {
          fs.removeSync(tmpFile);
        }).
        done(() => done(), done);
    });
    
    it('should merge params on top of imported params', (done) => {
      var tmpFile = path.join(process.cwd(), 'paramsConfig.json');
      var resourceCollection;

      fs.outputJsonSync(tmpFile, {
        params: {
          bar: 'barrumpdidum',
          qux: 'qaz'
        },
        resources: []
      });

      resourceCollection = new ResourceCollection({
        imports: [
          './paramsConfig.json'
        ],
        params: {
          foo: 'faz',
          bar: 'baz'
        },
        resources: [
          {
            name: 'fooService',
            type: 'Foo',
            actions: ['createResource'],
            config: {
              foo: { $ref: 'params.foo' },
              bar: { $ref: 'params.bar' },
              qux: { $ref: 'params.qux'}
            }
          }
        ]
      });
      resourceCollection.setConfigManager(configManager);

      resourceCollection.createResource().
        then(() => {
          assert.equal(fooService.config['foo'], 'faz', 'Should keep existing params');
          assert.equal(fooService.config['bar'], 'baz', 'Should override params');
          assert.equal(fooService.config['qux'], 'qaz', 'Should add new params');
        }).
        finally(() => {
          fs.removeSync(tmpFile);
        }).
        done(() => done(), done);
    });

    it('should import resources', (done) => {
      var tmpFile = path.join(process.cwd(), 'resourcesConfig.json');
      var resourceCollection;

      fs.outputJsonSync(tmpFile, {
        params: {},
        resources: [
          // This one should be overridden by main config
          {
            name: 'fooService',
            type: 'Foo',
            actions: ['createResource'],
            config: {
              foo: 'foo from import'
            }
          },
          {
            name: 'barService',
            type: 'Bar',
            actions: ['createResource'],
            config: {
              bar: 'bar from import'
            }
          }
        ]
      });

      resourceCollection = new ResourceCollection({
        imports: [
          './resourcesConfig.json'
        ],
        params: {},
        resources: [
          {
            name: 'fooService',
            type: 'Foo',
            actions: ['createResource'],
            config: {
              foo: 'foo from main'
            }
          }
        ]
      });
      resourceCollection.setConfigManager(configManager);

      resourceCollection.createResource().
        then(() => {
          assert.equal(fooService.config['foo'], 'foo from main', 'Should keep resources from main');
          assert.equal(barService.config['bar'], 'bar from import', 'Should add resources from import')
        }).
        finally(() => {
          fs.removeSync(tmpFile);
        }).
        done(() => done(), done);
    });

    it('should deploy resources in order', (done) => {
      var resourceCollection = new ResourceCollection({
        resources: [
          {
            name: 'fooService',
            type: 'Foo',
            actions: ['createResource'],
            config: {}
          },
          {
            name: 'barService',
            type: 'Bar',
            actions: ['createResource'],
            config: {}
          }
        ]
      });
      resourceCollection.setConfigManager(configManager);

      resourceCollection.createResource().
        then(() => {
          assert(fooService.createResource.calledBefore(barService.createResource), "Should have deployed fooService before barService");
        }).
        done(() => done(), done);
    });

    it('should return resource result objects', (done) => {
      var resourceCollection = new ResourceCollection({
        resources: [
          {
            name: 'fooService',
            type: 'Foo',
            actions: ['createResource'],
            config: {
              result: {foo: 'faz'}
            }
          },
          {
            name: 'barService',
            type: 'Bar',
            actions: ['createResource'],
            config: {
              result: {bar: 'baz'}
            }
          }
        ]
      });
      resourceCollection.setConfigManager(configManager);

      resourceCollection.createResource().
        then((result:ResourceCollectionResult) => {
          assert(result.results[0]['foo'] === 'faz', 'Should contain foo result');
          assert(result.results[1]['bar'] === 'baz', 'Should contain bar result');
        }).
        done(() => done(), done);
    });

    it('should run the specified actions against the resource', (done) => {
      var resourceCollection = new ResourceCollection({
        resources: [
          {
            name: 'fooService',
            type: 'Foo',
            actions: ['actionA', 'actionB'],
            config: {
              result: {foo: 'faz'}
            }
          }
        ]
      });
      resourceCollection.setConfigManager(configManager);

      fooService['actionA'] = MockAction('actionA');
      fooService['actionB'] = MockAction('actionB');

      resourceCollection.createResource().
        then(() => {
          assert(fooService['actionA'].called, 'Should have run actionA');
          assert(fooService['actionB'].called, 'Should have run actionB');
          assert(fooService['actionA'].calledBefore(fooService['actionB']),
            'Should have run actions in order');
        }).
        done(() => done(), done);
    });

  });

  function MockAction(name?:string) {
    var action = sinon.expectation.create(name);
    action.returns(when({}));

    return action;
  }

});