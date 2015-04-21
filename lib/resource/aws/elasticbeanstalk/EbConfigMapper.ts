/// <reference path="../../../../typings/vendor.d.ts" />

import AWS = require('aws-sdk');
import ConfigError = require('../../../error/ConfigError');
import debugMod = require('debug');
import fs = require('fs-extra');
import EbOption = require('./EbOption');
import path = require('path');
import when = require('when');
import EbEnvironmentConfig = require('./config/EbEnvironmentConfigInterface')

var debug = debugMod('EbConfigMapper');

class EbConfigMapper {

    protected eb:AWS.ElasticBeanstalk;
    protected config:any;
    protected tierConfig:any;
    protected optionsConfigMap:any;

    public construct(eb?:any, tierConfig?:any, optionsConfigMap?:any) {
        this.eb = eb;

        if (!tierConfig) {
            debug('No tierConfig supplied, loading from config dir.');
            tierConfig = fs.readJsonSync(path.join(__dirname, '..', '..', 'config', 'eb-config-tiers.json'));
        }
        this.tierConfig = tierConfig;

        if (!optionsConfigMap) {
            debug('No optionsConfigMap supplied, loading from config dir.');
            optionsConfigMap = fs.readJsonSync(path.join(__dirname, '..', '..', 'config', 'eb-config-map.json'));
        }
        this.optionsConfigMap = optionsConfigMap;
    }

    /**
     *
     * @param os
     * @param solutionStackShortName
     * @returns {Promise<string>}
     */
    public getLatestSolutionStack(os, solutionStackShortName):when.Promise<string> {
        return when.promise<string>(function (resolve, reject) {
            this.eb.listAvailableSolutionStacks(function (err, stackResult) {
                if (err) {
                    return reject(err);
                }
                if (stackResult.SolutionStacks && stackResult.SolutionStacks.length) {
                    for (var i = 0; i < stackResult.SolutionStacks.length; i++) {
                        var solutionStackName = stackResult.SolutionStacks[i];
                        if (solutionStackName.indexOf(os) !== -1 && solutionStackName.indexOf(solutionStackShortName) !== -1) {
                            return resolve(solutionStackName);
                        }
                    }
                }
                reject(new Error("Couldn't find a solution for the requested stack: " + os + " running " + solutionStackShortName));
            });
        }.bind(this));
    }

    /**
     * Get EbCreate Config
     *
     * Gets a config ready for AWS ElasticBeanstalk createEnvironment.
     */
    public getEbCreateConfig(config:EbEnvironmentConfig):When.Promise<AWS.ElasticBeanstalk.Params.createEnvironment> {
        return this.getLatestSolutionStack(config.solutionStack.os, config.solutionStack.stack)
            .then(function (solutionStackName) {
                var optionsSettings = [];
                var mappedOptions = [];
                var rawOptions = [];
                var envVars = [];

                if (config.options) {
                    mappedOptions = EbConfigMapper.getOptionsConfigMapped(config.options, this.optionsConfigMap);
                }
                if (config.rawOptions) {
                    rawOptions = EbConfigMapper.getRawOptionsMapped(config.rawOptions);
                }
                if (config.environmentVars) {
                    envVars = EbConfigMapper.getEnvironmentVarsMapped(config.environmentVars);
                }
                optionsSettings = optionsSettings.concat(mappedOptions, rawOptions, envVars);


                return {
                    "ApplicationName": config.applicationName,
                    "EnvironmentName": config.environmentName,
                    "Description": config.description,
                    "CNAMEPrefix": config.cnamePrefix,
                    "Tier": this.getTier(config.tier, this.tierConfig),
                    "Tags": config.tags,
                    "TemplateName": config.templateName || null,
                    "SolutionStackName": solutionStackName,
                    "OptionSettings": optionsSettings
                }
            }.bind(this));
    }

    /**
     * Get Options Config, Mapped
     *
     * Maps options in the user friendly config way to the Elastic Beanstalk EbOptions array
     */
    public static getOptionsConfigMapped(optionsConfig:Dictionary<any>, optionsConfigMap:Dictionary<any>, results?:Array<EbOption>):Array<EbOption> {
        if (results === undefined) {
            results = [];
        }
        for (var i in optionsConfig) {
            if (optionsConfig.hasOwnProperty(i)) {
                if (optionsConfig[i] instanceof Object) {
                    EbConfigMapper.getOptionsConfigMapped(optionsConfig[i], optionsConfigMap[i], results);
                }
                else {
                    if (optionsConfigMap[i]) {
                        var keyParts = optionsConfigMap[i].split('.');
                        var namespace = keyParts[0];
                        var optionName = keyParts[1];
                        var value = optionsConfig[i];
                        results.push({
                            Namespace: namespace,
                            OptionName: optionName,
                            Value: value
                        });
                    }
                    else {
                        throw new ConfigError('options -> ' + i, "Couldn't find map for option key " + i + ", are you sure this is a valid key for the options config?");
                    }
                }
            }
        }
        return results;
    }

    /**
     * Get Raw Options, Mapped
     *
     * Maps raw options to the Elastic Beanstalk friendly EbOptions array
     */
    public static getRawOptionsMapped(rawOptions:Dictionary<any>):Array<EbOption> {
        var results = [];
        for (var optionName in rawOptions) {
            if (rawOptions.hasOwnProperty(optionName)) {
                var keyParts = optionName.split('.');
                var namespace = keyParts[0];
                var optionName = keyParts[1];
                var value = rawOptions[optionName];
                results.push({
                    Namespace: namespace,
                    OptionName: optionName,
                    Value: value
                });
            }
        }
        return results;
    }

    /**
     * Get Environment Variable Options, Mapped
     *
     * Maps Environment Options to the Elastic Beanstalk friendly EbOptions array
     */
    public static getEnvironmentVarsMapped(envVarOptions:Dictionary<any>):Array<EbOption> {
        var results = [];
        for (var optionName in envVarOptions) {
            if (envVarOptions.hasOwnProperty(optionName)) {
                results.push({
                    Namespace: 'aws:elasticbeanstalk:application:environment',
                    OptionName: optionName,
                    Value: envVarOptions[optionName]
                });
            }
        }
        return results;
    }

    /**
     * Get Tier
     *
     * Gets a tier config name and passed config.
     */
    public static getTier(tierName:string, tierConfig:any):any {
        var result = tierConfig[tierName];
        if (result === undefined) {
            throw new ConfigError('tier', tierName + " is an invalid tier and the configuration couldn't be found for that tier.");
        }
        return result;
    }
}

export = EbConfigMapper;