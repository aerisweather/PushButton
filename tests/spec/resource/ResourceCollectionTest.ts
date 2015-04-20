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
            config: {}
          },
          {
            name: 'barService',
            type: 'Bar',
            config: {}
          }
        ]
      });
      resourceCollection.setConfigManager(configManager);

      resourceCollection.deploy().
        then(() => {
          assert(fooService.deploy.called, "Should have deployed fooService");
          assert(barService.deploy.called, "Should have deployed barService");
        }).
        done(() => done(), done);
    });

    it('should deploy resources in order', (done) => {
      var resourceCollection = new ResourceCollection({
        resources: [
          {
            name: 'fooService',
            type: 'Foo',
            config: {}
          },
          {
            name: 'barService',
            type: 'Bar',
            config: {}
          }
        ]
      });
      resourceCollection.setConfigManager(configManager);

      resourceCollection.deploy().
        then(() => {
          assert(fooService.deploy.calledBefore(barService.deploy), "Should have deployed fooService before barService");
        }).
        done(() => done(), done);
    });

    it('should return resource result objects', (done) => {
      var resourceCollection = new ResourceCollection({
        resources: [
          {
            name: 'fooService',
            type: 'Foo',
            config: {
              result: { foo: 'faz' }
            }
          },
          {
            name: 'barService',
            type: 'Bar',
            config: {
              result: { bar: 'baz' }
            }
          }
        ]
      });
      resourceCollection.setConfigManager(configManager);

      resourceCollection.deploy().
        then((result:ResourceCollectionResult) => {
          assert(result.results[0].foo === 'faz', 'Should contain foo result');
          assert(result.results[1].bar === 'baz', 'Should contain bar result');
        }).
        done(() => done(), done);
    });

  });

});