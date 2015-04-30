/// <reference path="../../typings/vendor.d.ts" />
import when = require('when');
import sequence = require('when/sequence');
import whenNode = require('when/node');
import _ = require('lodash');
import ResourceCollectionConfig = require('./../resource/config/ResourceCollectionConfigInterface');
import Result = require('../resource/result/ResultInterface');
import ResourceCollectionResult = require('../resource/result/ResourceCollectionResultInterface');
import Resource = require('../resource/ResourceInterface');
import ResourceServiceConfig = require('../config-manager/config/ResourceServiceConfigInterface');
import defaultResourceMap = require('../../config/resource-map');
import ConfigManager = require('../config-manager/ConfigManager');
import events = require('events');
import fs = require('fs-extra');
import path = require('path');


class ResourceCollection extends events.EventEmitter implements Resource {
  protected config:ResourceCollectionConfig;
  protected imports:ResourceCollectionConfig[];

  protected configManager:ConfigManager;

  constructor(config?:ResourceCollectionConfig) {
    super();
    this.config = this.processConfig(config || {});

    this.configManager = new ConfigManager();
    this.configManager.setResourceMap(defaultResourceMap);
  }

  protected processConfig(config:ResourceCollectionConfig):ResourceCollectionConfig {
    var readJsonSync = <any>fs.readJsonSync.bind(fs);         //  Fixes bad TS typing in fs.readJsonSync
    var importPaths:string[] = config.imports || [];
    var imports = importPaths.map<ResourceCollectionConfig>((relPath:String) => {
      var absPath = path.join(process.cwd(), relPath);
      return readJsonSync(absPath);
    });

    imports.forEach((importedConfig:ResourceCollectionConfig) => {
      // extends params
      config.params = _.extend(importedConfig.params, config.params);

      // extend resources
      importedConfig.resources.forEach((resourceConfig:ResourceServiceConfig) => {
        var mainConfigHasResource = !!_.findWhere(config.resources, { name: resourceConfig.name });
        if (!mainConfigHasResource) {
          config.resources.push(resourceConfig);
        }
      });
    });

    return config;
  }

  public createResource():when.Promise<ResourceCollectionResult> {
    return this.wireImports().
      then(() => this.configManager.wireParams(this.config.params || {})).
      then(() => this.createAllServices()).
      then((results:Result[]) => {
        return {
          message: 'All resources have deployed successfully.',
          results: results
        };
      });
  }

  protected wireParams() {
    var readJsonSync = <any>fs.readJsonSync.bind(fs);         //  Fixes bad TS typing in fs.readJsonSync

  }

  protected wireImports() {
    var readJsonSync = <any>fs.readJsonSync.bind(fs);         //  Fixes bad TS typing in fs.readJsonSync
    var importPaths:string[] = this.config.imports || [];
    var absolutePaths = importPaths.map<string>((relPath:string) => {
      return path.join(process.cwd(), relPath);
    });

    return sequence(absolutePaths.map<When.PromiseFn<any>>((path:string) => {
      return () => {
        var config:ResourceCollectionConfig = readJsonSync(path);
        return this.configManager.wireParams(config.params);
      };
    }));
  }

  protected createAllServices():When.Promise<Result[]> {
    // A set of PromiseFns,
    // each fn deploys a resource.
    var resourceDeployers = this.config.resources.
      map((serviceConfig:ResourceServiceConfig) =>
        () => this.createService(serviceConfig));

    // Run each resource deployer, in order.
    return sequence<Result[]>(resourceDeployers).
      then((res) => _.flatten<Result>(res));
  }

  protected createService(serviceConfig:ResourceServiceConfig):When.Promise<Result[]> {
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

  public setConfig(config:ResourceCollectionConfig) {
    this.config = this.processConfig(config);
  }

  public getConfig():ResourceCollectionConfig {
    return this.config;
  }
}

export = ResourceCollection;
