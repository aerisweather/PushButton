///<reference path="../../typings/vendor.d.ts" />
import wire = require('wire');
import when = require('when');
import _ = require('lodash');
import ResourceConfigInterface = require('../resource/config/ResourceConfigInterface');
import RunnerConfigInterface = require('./config/RunnerConfigInterface');
import ResourceInterface = require('../resource/ResourceInterface');
import RunnerContextInterface = require('./context/RunnerContextInterface');

class ConfigManager {
  protected resourceMap = {};
  protected plugins = [];
  protected context:RunnerContextInterface;

  public setResourceMap(serviceMap) {
    this.resourceMap = serviceMap;
  }

  public wireResource(resourceConfig:ResourceConfigInterface):When.Promise<ResourceInterface> {
    // Convert the resource config into a Wire.js `create` factory.
    // We assign it a unique key, so we can pluck it out later.
    var RESOURCE_KEY = _.uniqueId('RESOURCE_');
    var spec = <any>{};
    spec[RESOURCE_KEY] = this.toFactorySpec(resourceConfig);


    return this.wire<Wire.Factories.create, any>(spec).
      // pluck out just the resource object
      // and add it to the parent context
      then((context) => {
        var resource = context[RESOURCE_KEY];
        return this.addResource(resourceConfig.name, resource);
      });
  }

  public wireParams(params:any):When.Promise<any> {
    return this.wire<any,any>(params).
      then((paramsCtx) => {
        return this.getContext().
          then((context) => context.params = paramsCtx)
      });
  }

  public addResource(name:string, resource:ResourceInterface):When.Promise<ResourceInterface> {
    return this.getContext().
      then((context) => {
        return context.resources[name] = resource
      }).
      tap((resource) => {
        var ctx = this.context;
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

  public getContext():When.Promise<RunnerContextInterface> {
    // Return the context, or wire up a new one.
    return this.context ?
      when(this.context) :
      this.createContext().
        then((context) => this.context = context);
  }

  protected createContext():When.Promise<RunnerContextInterface> {
    var spec:RunnerConfigInterface = {
      params: {},
      resources: []
    };
    return wire<RunnerConfigInterface, RunnerContextInterface>(spec);
  }

  protected toFactorySpec(resourceConfig:ResourceConfigInterface):Wire.Factories.create {
    return {
      create: {
        module: this.resourceMap[resourceConfig.type],
        args: [resourceConfig.config],
        isConstructor: true
      }
    };
  }
}
export = ConfigManager;