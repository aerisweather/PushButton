///<reference path="../../typings/vendor.d.ts" />
import PushButton = require('../../lib/PushButton');
import CliMock = require('../mock/CliMock');
import ResourceCollection = require('../../lib/resource/ResourceCollection');
import sinon = require('sinon');
import when = require('when');
import path = require('path');
import fs = require('fs-extra');
import assert = require('assert');
import _ = require('lodash');

describe('PushButton', () => {
  var pushButton:PushButton, cliMock:CliMock, resourceCollection:ResourceCollection;
  var cwdOrig = process.cwd();

  beforeEach(() => {
    var createResource;
    pushButton = new PushButton();

    cliMock = new CliMock();
    pushButton.setCli(cliMock);

    resourceCollection = new ResourceCollection();
    createResource = sinon.expectation.create('ResourceCollection#createResource');
    createResource.returns(when({
      message: 'all done',
      results: [{ message: 'all done' }]
    }));
    resourceCollection['createResource'] = createResource;
    pushButton.setResourceCollection(resourceCollection);
  });

  beforeEach(() => {
    process.chdir(path.join(__dirname, './fixture/PushButton'));
  });

  afterEach(() => {
    process.chdir(cwdOrig);
  });




  describe('config loading', () => {

    it('should load config at path specified in cli flag', (done) => {
      cliMock.setFlaggedArg('--config',
        path.join(__dirname, './fixture/PushButton/PushButtonCustomPath.json'));

      pushButton.run().
        tap(() => {
          assertParamEquals('PushButtonCustomPath.json', 'myFileName', 'Should have loaded config at PushButtonCustomPath.json');
        }).
        done(() => done(), done);
    });

    it('should load config from cwd, if no configPath flag is set', (done) => {
      pushButton.run().
        tap(() => {
          assertParamEquals('PushButton.json', 'myFileName', 'Should have loaded config at PushButton.json');
        }).
        done(() => done(), done);
    });
    
    describe('imports', () => {

      it('should import and merge params', (done) => {
        fs.outputJsonSync(path.join(__dirname, './tmp/main.json'), {
          imports: [
            './external.json'
          ],
          params: {
            foo: 'fazMain',
            bar: 'bazMain',
            nested: {
              foo: 'fazMain',
              bar: 'bazMain'
            }
          },
          resources: []
        });

        fs.outputJsonSync(path.join(__dirname, './tmp/external.json'), {
          params: {
            bar: 'bazExternal',
            qux: 'qazExternal',
            nested: {
              bar: 'bazExternal',
              qux: 'qazExternal'
            }
          },
          resources: []
        });

        cliMock.setFlaggedArg('--config',
          path.join(__dirname, './tmp/main.json'));

        pushButton.run().
          tap(() => {
            var params = resourceCollection.getConfig().params;

            assert.equal(params.foo, 'fazMain', 'Main params should still exist');
            assert.equal(params.bar, 'bazMain', 'Main params should override imported params');
            assert.equal(params.qux, 'qazExternal', 'External params should be added');

            assert.equal(params.nested.foo, 'fazMain', 'Main params should still exist (nested)');
            assert.equal(params.nested.bar, 'bazMain', 'Main params should override imported params (nested)');
            assert.equal(params.nested.qux, 'qazExternal', 'External params should be added (nested)');
          }).
          finally(() => fs.removeSync(path.join(__dirname, './tmp'))).
          done(() => done(), done);
      });
      
      it('should import and merge resources', (done) => {
        fs.outputJsonSync(path.join(__dirname, './tmp/main.json'), {
          imports: [
            './external.json'
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

        fs.outputJsonSync(path.join(__dirname, './tmp/external.json'), {
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

        cliMock.setFlaggedArg('--config',
          path.join(__dirname, './tmp/main.json'));

        pushButton.run().
          tap(() => {
            var resources = resourceCollection.getConfig().resources;

            assert.equal(resources.length, 2);
            assert.equal(resources[0].name, 'fooService');
            assert.equal(resources[1].name, 'barService');

            assert.equal(resources[0].config['foo'], 'foo from main', 'Should keep resources from main');
            assert.equal(resources[1].config['bar'], 'bar from import', 'Should add resources from import')
          }).
          finally(() => fs.removeSync(path.join(__dirname, './tmp'))).
          done(() => done(), done);
      });

    });

  });

  describe('parsing arguments', () => {

    it('should parse arguments from CLI flags', (done) => {
      cliMock.setFlaggedArg('--foo', 'bar');

      pushButton.run().
        tap(() => {
          assertParamEquals('bar', 'foo');
        }).
        done(() => done(), done);
    });

    it('should parse arguments using interactive CLI prompt', (done) => {
      cliMock.prepareAnswerAny('bar');

      pushButton.run().
        tap(() => {
          assertParamEquals('bar', 'foo');
          assert(cliMock.wasAskedQuestion("What the foo?"));
        }).
        done(() => done(), done);
    });

    it('should import and add args', (done) => {
      fs.outputJsonSync(path.join(__dirname, './tmp/main.json'), {
        imports: [
          './external.json'
        ],
        args: [
          {
            "param": "foo",
            "flag": "--foo",
            "description": "What the foo?"
          }
        ],
        params: {},
        resources: []
      });

      fs.outputJsonSync(path.join(__dirname, './tmp/external.json'), {
        params: {},
        resources: [],
        args: [
          {
            "param": "bar",
            "flag": "--bar",
            "description": "What the bar?"
          }
        ]
      });

      cliMock.setFlaggedArg('--config',
        path.join(__dirname, './tmp/main.json'));

      cliMock.prepareAnswer('What the foo?', 'faz');
      cliMock.prepareAnswer('What the bar?', 'baz');

      pushButton.run().
        tap(() => {
          assert(cliMock.wasAskedQuestion('What the foo?'));
          assert(cliMock.wasAskedQuestion('What the bar?'));
        }).
        finally(() => fs.removeSync(path.join(__dirname, './tmp'))).
        done(() => done(), done);
    });

  });

  describe('deploying resources', () => {

    it('should deploy the configured resources', (done) => {
      pushButton.run().
        tap(() => {
          var createResource = <SinonExpectation>resourceCollection['createResource'];
          assert(createResource.called, 'Should have told the resourceCollection to create resources');
          assert(_.isEqual(resourceCollection.getConfig().resources, [{ name: 'my-resource' }]),
            'Should have configured resources for the resources collection.');
        }).
        done(() => done(), done);
    });
    
  });

  function assertParamEquals(value:any, param:string, msg?:string) {
    var actualValue = resourceCollection.getConfig().params[param];

    assert.equal(actualValue, value, msg);
  }

});