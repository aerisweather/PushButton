/// <reference path="../../typings/vendor.d.ts" />
import when = require('when');
import sequence = require('when/sequence');
import RunnerConfigInterface = require('./../resource/config/ResourceCollectionConfigInterface');
import ResultInterface = require('../resource/result/ResultInterface');
import ResourceCollectionResult = require('../resource/result/ResourceCollectionResultInterface');
import ResourceInterface = require('../resource/ResourceInterface');
import ResourceConfigInterface = require('../resource/config/ResourceConfigInterface');
import resourceMap = require('../../config/resource-map');
import ConfigManager = require('../config-manager/ConfigManager');


class ResourceCollection implements ResourceInterface {
  protected config:RunnerConfigInterface;
  /** Maps named resource services to Resource constructors. */
  protected resourceMap:Dictionary<any>;

  protected configManager:ConfigManager;

  constructor(config:RunnerConfigInterface) {
    this.config = config;
    this.configManager = new ConfigManager();
    this.resourceMap = resourceMap;
  }

  public deploy():when.Promise<ResourceCollectionResult> {
    return this.configManager.
      wireParams(this.config.params).
      then(() => this.deployAllResources()).
      then((results:ResultInterface[]) => {
        return {
          message: 'All resources have deployed successfully.',
          results: results
        };
      });
  }

  protected deployAllResources():When.Promise<ResultInterface[]> {
    // A set of PromiseFns, to deploy each resource
    var resourceDeployers = this.config.resources.
      map((resourceConfig:ResourceConfigInterface) =>
        () => this.deployResourceConfig(resourceConfig));

    // Run each resource deployer, in order.
    return sequence<ResultInterface>(resourceDeployers);
  }

  protected deployResourceConfig(resourceConfig:ResourceConfigInterface):When.Promise<ResultInterface> {
    return this.configManager.
      wireResource(resourceConfig).
      then((resource:ResourceInterface) => resource.deploy());
  }

  /** Maps named resource services to Resource constructors. */
  public setResourceMap(resourceMap:Dictionary<any>) {
    this.resourceMap = resourceMap;
  }

  public setConfigManager(configManager:ConfigManager) {
    this.configManager = configManager;
  }
}

export = ResourceCollection;
