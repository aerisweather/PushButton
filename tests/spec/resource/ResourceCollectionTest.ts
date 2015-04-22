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
            actions: ['deploy'],
            config: {}
          },
          {
            name: 'barService',
            type: 'Bar',
            actions: ['deploy'],
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

    it('should deploy resources in order', (done) => {
      var resourceCollection = new ResourceCollection({
        resources: [
          {
            name: 'fooService',
            type: 'Foo',
            actions: ['deploy'],
            config: {}
          },
          {
            name: 'barService',
            type: 'Bar',
            actions: ['deploy'],
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
            actions: ['deploy'],
            config: {
              result: {foo: 'faz'}
            }
          },
          {
            name: 'barService',
            type: 'Bar',
            actions: ['deploy'],
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

      fooService['actionA'] = sinon.expectation.create();
      fooService['actionB'] = sinon.expectation.create();

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

});