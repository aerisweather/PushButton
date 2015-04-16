var wire = require('wire');
var when = require('when');
var sequence = require('when/sequence');
var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;

var Runner = function(config) {
  this.config = config;

  this.eventEmitter = new EventEmitter();
};

Runner.plugins = [
  require('./Plugin/tmpl')
];

Runner.serviceMap = {
  SQS: require('./Service/SqsQueue'),
  EB_WORKER: require('./Service/EbWorker'),
  EB_WEB_APP: require('./Service/EbWebServer')
};

Runner.prototype.run = function() {
  // Wire up everything but the resources.
  // (resources will be wired sequentially)
  var topLevelSpec = _.omit(this.config, 'resources');

  _.extend(topLevelSpec, {
    resources: {},
    $plugins: Runner.$plugins
  });

  // Create a sequence of promise-functions to
  // deploy each resource
  var promisesToDeployResources = when.map(this.config.resources, function(resourceConfig) {
    return this.deployConfiguredResource.
      bind(this, resourceConfig);
  }.bind(this));

  var deployAll = _.partial(sequence, promisesToDeployResources);

  return wire(topLevelSpec).
    with(this).
    tap(this.setContext).
    then(deployAll);
};

Runner.prototype.Emitter = function(event) {
  return function(payload) {
    this.eventEmitter.emit(event, payload);
  }.bind(this);
};

Runner.prototype.setContext = function(context) {
  this.context = context;
};

Runner.prototype.deployConfiguredResource = function(resourceConfig) {
  return this.wireResource(resourceConfig).

    then(function(resource) {
      return resource.run();
    }).

    // Notify listeners that we deployed one
    tap(this.Emitter('deploy:resource'));
};

Runner.prototype.toFactorySpec = function(resourceConfig) {
  return {
    create: {
      module: Runner.serviceMap[resourceConfig.type],
      args: [resourceConfig.config],
      isConstructor: true
    }
  };
};

Runner.prototype.wireResource = function(resourceConfig) {
  // Convert the app config into a Wire.js factory spec
  var resourceFactorySpec = this.toFactorySpec(resourceConfig);

  // Assign an arbitrary key to the resource
  // (so we can grab it later)
  var RESOURCE_KEY = _.uniqueId('RESOURCE_');
  var spec = {};
  spec[RESOURCE_KEY] = resourceFactorySpec;

  spec.$plugins = Runner.plugins;

  return this.context.wire(spec).

    // grab just the resource object.
    then(function(context) {
      return context[RESOURCE_KEY];
    }).

    // Add the resource to the top-level context,
    // so that other resources have access to it
    tap(this.addResourceToContext.bind(this, resourceConfig.name));
};

Runner.prototype.addResourceToContext = function(name, resource) {
  this.context.resources[name] = resource;

  return this.context;
};


// I'm thinking that the PushButton runner will look for
// PushButton.json in the current dir
// (if it's not specified in a CLI flag)
var turbineConfig = require('./PushButton.json');

var runner = new Runner(turbineConfig);
runner.run().
  then(function(args) {
    console.log('done!');
    process.exit(0);
  }).
  catch(function(err) {
    console.error(err.stack);
    process.exit(1);
  });

runner.eventEmitter.on('deploy:resource', function(result) {
  console.log(result.message);
  console.log(result.service);
});