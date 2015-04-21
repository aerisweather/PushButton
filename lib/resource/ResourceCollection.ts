/// <reference path="../../typings/vendor.d.ts" />
import when = require('when');
import sequence = require('when/sequence');
import _ = require('lodash');
import ResourceCollectionConfig = require('./../resource/config/ResourceCollectionConfigInterface');
import Result = require('../resource/result/ResultInterface');
import ResourceCollectionResult = require('../resource/result/ResourceCollectionResultInterface');
import Resource = require('../resource/ResourceInterface');
import ResourceServiceConfig = require('../config-manager/config/ResourceServiceConfigInterface');
import defaultResourceMap = require('../../config/resource-map');
import ConfigManager = require('../config-manager/ConfigManager');
import events = require('events');

var EventEmitter = events.EventEmitter;


class ResourceCollection implements Resource {
  protected config:ResourceCollectionConfig;

  protected configManager:ConfigManager;
  protected emit(event: string, ...args:any[]);
  public on(event:string, cb:(...args:any[]) => void);

  constructor(config:ResourceCollectionConfig) {
    this.config = config;

    this.configManager = new ConfigManager();
    this.configManager.setResourceMap(defaultResourceMap);

    EventEmitter.call(this);
  }

  public deploy():when.Promise<ResourceCollectionResult> {
    return this.configManager.
      wireParams(this.config.params || {}).
      then(() => this.deployAllServices()).
      then((results:Result[]) => {
        return {
          message: 'All resources have deployed successfully.',
          results: results
        };
      });
  }

  protected deployAllServices():When.Promise<Result[]> {
    // A set of PromiseFns,
    // each fn deploys a resource.
    var resourceDeployers = this.config.resources.
      map((serviceConfig:ResourceServiceConfig) =>
        () => this.deployService(serviceConfig));

    // Run each resource deployer, in order.
    return sequence<Result[]>(resourceDeployers).
      then((res) => _.flatten<Result>(res));
  }

  protected deployService(serviceConfig:ResourceServiceConfig):When.Promise<Result[]> {
    return this.configManager.
      wireResource(serviceConfig).
      then((resource:Resource) => {
        var actions = serviceConfig.actions.
          map((action:string) => {
            return () => {
              return resource[action]().
                tap((result) => {
                  this.emit('deploy', result, resource);
                }).
                catch((err:Error) => {
                  this.emit('error', err, resource);
                  throw err;
                });
            }
          }
        );

        return sequence<Result>(actions);
      });
  }

  /** Maps named resource services to Resource constructors. */
  public setResourceMap(resourceMap:Dictionary<any>) {
    this.configManager.setResourceMap(resourceMap);
  }

  public setConfigManager(configManager:ConfigManager) {
    this.configManager = configManager;
  }
}
_.extend(ResourceCollection.prototype, EventEmitter.prototype);

export = ResourceCollection;
