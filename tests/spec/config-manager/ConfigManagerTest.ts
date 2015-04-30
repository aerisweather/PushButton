///<reference path="../../../typings/vendor.d.ts" />
import ConfigManager = require('../../../lib/config-manager/ConfigManager');
import sinon = require('sinon');
import _ = require('lodash');
import ResourceInterface = require('../../../lib/resource/ResourceInterface');
import assert = require('assert');
import tmpl = require('../../../lib/config-manager/plugin/tmpl');
import ResourceMock = require('../../mock/ResourceMock');

describe('ConfigManager', () => {

  describe('wire', () => {

    describe('wireResource', () => {
      var fooService:ResourceMock, barService:ResourceMock, resourceMap:any;

      beforeEach(() => {
        fooService = new ResourceMock();
        barService = new ResourceMock();

        resourceMap = {
          Foo: fooService.getCtorMock(),
          Bar: barService.getCtorMock()
        };
      });

      it('should create a resource from a config', (done) => {
        var configManager = new ConfigManager();
        configManager.setResourceMap(resourceMap);

        configManager.wireResource({
          name: 'foo-service',
          type: 'Foo',
          config: {foo: 'faz'},
          actions: []
        }).
          then((resource:ResourceMock) => {
            assert(resource === fooService, 'Expected to create barService');
            assert(resource.config.foo === 'faz', 'Expected barService config to be set');
          }).
          done(() => done(), done);
      });

      it('should create a resource which references a previous resource', (done) => {
        var configManager = new ConfigManager();
        configManager.setResourceMap(resourceMap);

        configManager.wireResource({
          name: 'foo-service',
          type: 'Foo',
          config: {foo: 'faz'},
          actions: []
        }).
          then((fooService:ResourceMock) => {
            return configManager.wireResource({
              name: 'bar-service',
              type: 'Bar',
              config: {
                fooService: {$ref: 'resources.foo-service'},
                fooServiceFooConfig: {$ref: 'resources.foo-service.config.foo'}
              },
              actions: []
            });
          }).
          then((barService:ResourceMock) => {
            assert(barService.config.fooService === fooService, 'Expected fooService to be injected into barService');
            assert(barService.config.fooServiceFooConfig === 'faz', 'Expected fooService.config.foo to be injected into barService');
          }).
          done(() => done(), done);
      });

      it('should create a resource which references a param', (done) => {
        var configManager = new ConfigManager();
        configManager.setResourceMap(resourceMap);

        configManager.wireParams({
          paramA: 'paramValA'
        }).
          then((params:any) => {
            assert(params.paramA === 'paramValA', 'Expected wireParams to return params');

            return configManager.wireResource({
              name: 'foo-service',
              type: 'Foo',
              config: {
                foo: {$ref: 'params.paramA'}
              },
              actions: []
            })
          }).
          then((fooService:ResourceMock) => {
            assert(fooService.config.foo === 'paramValA', 'Expected reference to params to resolve');
          }).
          done(() => done(), done);

      });

      it('should extend params', () => {
        var configManager = new ConfigManager();
        configManager.setResourceMap(resourceMap);

        configManager.wireParams({
          foo: 'faz',
          bar: 'baz'
        }).
          then((params:any) => {
            return configManager.wireParams({
              bar: 'rab',
              rab: 'bar'
            });
          }).
          then((params:any) => {
            assert.equal(params.foo, 'faz', 'Should keep existing params');
            assert.equal(params.bar, 'rab', 'Should override with new params');
            assert.eqaul(params.rab, 'bar', 'Should add new params');
          });
      });

      it('should create a resource using the tmpl plugin', (done) => {
        var configManager = new ConfigManager();
        configManager.setResourceMap(resourceMap);

        configManager.addPlugin(tmpl);

        configManager.wireParams({
          paramA: 'paramValA'
        }).
          then((params:any) => {
            assert(params.paramA === 'paramValA', 'Expected wireParams to return params');

            return configManager.wireResource({
              name: 'foo-service',
              type: 'Foo',
              config: {
                foo: {$ref: 'tmpl!foo-{{params.paramA}}'}
              },
              actions: []
            })
          }).
          then((fooService:ResourceMock) => {
            assert(fooService.config.foo === 'foo-paramValA', 'Expected reference to params to resolve');
          }).
          done(() => done(), done);
      });

    });

  });

});