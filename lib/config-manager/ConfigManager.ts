///<reference path="../../typings/vendor.d.ts" />
import wire = require('wire');
import when = require('when');
import _ = require('lodash');
import ResourceServiceConfig = require('./config/ResourceServiceConfigInterface');
import ResourceCollectionConfig = require('../resource/config/ResourceCollectionConfigInterface');
import Resource = require('../resource/ResourceInterface');
import ResultInterface = require('../resource/result/ResultInterface');
import RunnerContext = require('context/RunnerContextInterface');
import tmplPlugin = require('./plugin/tmpl');
import jsonPlugin = require('./plugin/json');

class ConfigManager {
  protected resourceMap = {};
  protected plugins = [];
  protected context:RunnerContext;

  public setResourceMap(serviceMap) {
    this.resourceMap = serviceMap;
    this.plugins = [
      tmplPlugin,
      jsonPlugin
    ];
  }

  public wireResource(serviceConfig:ResourceServiceConfig):When.Promise<Resource> {
    // Convert the resource config into a Wire.js `create` factory.
    // We assign it a unique key, so we can pluck it out later.
    var RESOURCE_KEY = _.uniqueId('RESOURCE_');
    var spec = <any>{};
    spec[RESOURCE_KEY] = this.toFactorySpec(serviceConfig);


    return this.wire<Wire.Factories.create, any>(spec).
      // pluck out just the resource object
      // and add it to the parent context
      then((context) => {
        var resource = context[RESOURCE_KEY];
        return this.addResource(serviceConfig.name, resource);
      });
  }

  public wireParams(params:any):When.Promise<any> {
    return this.wire<any,any>(params).
      then((paramsCtx) => {
        return this.getContext().
          then((context) => _.merge(context.params, paramsCtx));
      });
  }

  public addResource(name:string, resource:Resource):When.Promise<Resource> {
    return this.getContext().
      then((context) => {
        return context.resources[name] = resource
      });
  }

  public addResult(name, action, result:ResultInterface) {
    return this.getContext().
      then((context) => {
        return context.results[name][action] = result;
      });
  }

  public addPlugin(plugin:any) {
    this.plugins.push(plugin);
  }

  protected wire<TSpec, TContext>(spec:TSpec):When.Promise<TContext> {
    // Add plugins to spec
    spec['$plugins'] = _.clone(this.plugins);

    return this.getContext().
      then((context) => {
        return context.wire<TSpec, TContext>(spec);
      });
  }

  public getContext():When.Promise<RunnerContext> {
    // Return the context, or wire up a new one.
    return this.context ?
      when(this.context) :
      this.createContext().
        then((context) => this.context = context);
  }

  protected createContext():When.Promise<RunnerContext> {
    var spec:ResourceCollectionConfig = {
      params: {},
      resources: [],
      results: []
    };
    return wire<ResourceCollectionConfig, RunnerContext>(spec);
  }

  protected toFactorySpec(serviceConfig:ResourceServiceConfig):Wire.Factories.create {
    var ResourceType = this.resourceMap[serviceConfig.type];

    if (!ResourceType) {
      throw new Error('Unable to find resource for type "' + serviceConfig.type + '".');
    }

    return {
      create: {
        module: this.resourceMap[serviceConfig.type],
        args: [serviceConfig.config],
        isConstructor: true
      }
    };
  }
}
export = ConfigManager;