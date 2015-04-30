///<reference path="../typings/vendor.d.ts" />

import fs = require('fs-extra');
import path = require('path');
import glob = require('glob');
import ResourceCollection = require('./resource/ResourceCollection');
import when = require('when');
import sequence = require('when/sequence');
import _ = require('lodash');
import PushButtonConfig = require('./config/PushButtonConfigInterface');
import PushButtonArg = require('./config/PushButtonArgInterface');
import ConfigManager = require('./config-manager/ConfigManager');
import ResourceServiceConfig = require('./config-manager/config/ResourceServiceConfigInterface')
import resourceMap = require('../config/resource-map');
import Cli = require('./util/Cli');
var readJsonSync = <any>fs.readJsonSync.bind(fs);         //  Fixes bad TS typing in fs.readJsonSync


class PushButton {
  protected config:PushButtonConfig;
  protected cli:Cli;
  protected resourceCollection:ResourceCollection;

  public constructor() {
    this.cli = new Cli();
    this.resourceCollection = new ResourceCollection();
  }

  public run() {
    return when({}).
      then(() => this.loadConfig()).
      tap((config) => this.config = config).
      then((config) => this.parseArgs(config.args || [])).
      then((argParams) => _.extend(this.config.params, argParams)).
      then(() => this.deployResources());
  }

  protected loadConfig():PushButtonConfig {
    var configPath = this.cli.getFlaggedArg<string>('-c', '--config');
    var readJsonSync = <any>fs.readJsonSync.bind(fs);
    var config:PushButtonConfig;

    if (!configPath) {
      // Look for config in current dir
      configPath = path.join(process.cwd(), 'PushButton.json');
    }

    config = readJsonSync(configPath);
    return this.processConfig(config, path.dirname(configPath));
  }

  protected processConfig(config:PushButtonConfig, configBasePath:string) {
    var importPaths:string[];
    var imports:PushButtonConfig[];

    // Set config defaults
    function applyDefaults(config:any):PushButtonConfig {
      return _.defaults<any, PushButtonConfig>(config, {
        imports: [],
        params: {},
        args: [],
        resources: []
      });
    }
    applyDefaults(config);

    // Import configs
    importPaths = config.imports || [];
    imports = importPaths.map<PushButtonConfig>((relPath:String) => {
      var absPath = path.join(configBasePath, relPath);
      var importedConfig = readJsonSync(absPath);
      return applyDefaults(importedConfig);
    });

    imports.forEach((importedConfig:PushButtonConfig) => {
      // extends params
      config.params = _.merge(importedConfig.params, config.params);

      // extend resources
      importedConfig.resources.
        forEach((resourceConfig:ResourceServiceConfig) => {
          var mainConfigHasResource = !!_.findWhere(config.resources, {name: resourceConfig.name});
          if (!mainConfigHasResource) {
            config.resources.push(resourceConfig);
          }
        });

      // Add args
      importedConfig.args.
        forEach((arg:PushButtonArg) => config.args.push(arg));
    });

    return config;
  }

  /** Returns a key-value hash of arg param values. */
  protected parseArgs(args:PushButtonArg[]):When.Promise<any> {
    var reduce = <any>when['reduce'];
    return reduce(args, (params, arg:PushButtonArg) => {
      return this.getArgValue<any>(arg).
        then((val) => {
          params[arg.param] = val;
          return params;
        });
    }, {});
  }

  protected getArgValue<TValue>(arg:PushButtonArg):When.Promise<TValue> {
    var question:string;
    var defaultValue:any;
    // Try as cli flag, first
    var argValue = this.cli.getFlaggedArg<any>(arg.flag, arg.shortFlag);

    if (!_.isNull(argValue)) {
      return when(argValue);
    }

    defaultValue = this.config.params.hasOwnProperty(arg.param) ?
      this.config.params[arg.param] : null;

    return this.cli.ask(arg.description, defaultValue);
  }

  protected deployResources() {
    this.resourceCollection.setConfig(this.config);

    this.resourceCollection.on('deploy', function (result, resource) {
      console.log(result.message);
    });

    this.resourceCollection.on('error', function (error, resource) {
      console.error(error);
    });

    //Run!
    return this.resourceCollection.createResource();
  }

  public setCli(cli:Cli) {
    this.cli = cli;
  }

  public setResourceCollection(resourceCollection:ResourceCollection) {
    this.resourceCollection = resourceCollection;
  }

}

export = PushButton;


