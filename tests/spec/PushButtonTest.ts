///<reference path="../../typings/vendor.d.ts" />
import PushButton = require('../../lib/PushButton');
import CliMock = require('../mock/CliMock');
import ResourceCollection = require('../../lib/resource/ResourceCollection');
import sinon = require('sinon');
import when = require('when');
import path = require('path');
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