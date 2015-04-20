/// <reference path="../../typings/vendor.d.ts" />
import when = require('when');
import sequence = require('when/sequence');
import ResourceCollectionConfig = require('./../resource/config/ResourceCollectionConfigInterface');
import Result = require('../resource/result/ResultInterface');
import ResourceCollectionResult = require('../resource/result/ResourceCollectionResultInterface');
import Resource = require('../resource/ResourceInterface');
import ResourceConfig = require('../resource/config/ResourceConfigInterface');
import defaultResourceMap = require('../../config/resource-map');
import ConfigManager = require('../config-manager/ConfigManager');


class ResourceCollection implements Resource {
  protected config:ResourceCollectionConfig;

  protected configManager:ConfigManager;

  constructor(config:ResourceCollectionConfig) {
    this.config = config;

    this.configManager = new ConfigManager();
    this.configManager.setResourceMap(defaultResourceMap);
  }

  public deploy():when.Promise<ResourceCollectionResult> {
    return this.configManager.
      wireParams(this.config.params || {}).
      then(() => this.deployAllResources()).
      then((results:Result[]) => {
        return {
          message: 'All resources have deployed successfully.',
          results: results
        };
      });
  }

  protected deployAllResources():When.Promise<Result[]> {
    // A set of PromiseFns,
    // each fn deploys a resource.
    var resourceDeployers = this.config.resources.
      map((resourceConfig:ResourceConfig) =>
        () => this.deployResourceConfig(resourceConfig));

    // Run each resource deployer, in order.
    return sequence<Result>(resourceDeployers);
  }

  protected deployResourceConfig(resourceConfig:ResourceConfig):When.Promise<Result> {
    return this.configManager.
      wireResource(resourceConfig).
      then((resource:Resource) => resource.deploy());
  }

  /** Maps named resource services to Resource constructors. */
  public setResourceMap(resourceMap:Dictionary<any>) {
    this.configManager.setResourceMap(resourceMap);
  }

  public setConfigManager(configManager:ConfigManager) {
    this.configManager = configManager;
  }
}

export = ResourceCollection;
