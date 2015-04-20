/// <reference path="../../../../typings/vendor.d.ts" />

import AWS = require('aws-sdk');
import ConfigError = require('../../../error/ConfigError');
import debugMod = require('debug');
import fs = require('fs-extra');
import EbOption = require('./EbOption');
import path = require('path');
import when = require('when');

var debug = debugMod('EbConfig');

class EbConfig {

    eb:AWS.ElasticBeanstalk;
    config:any;
    tierConfig:any;
    optionsConfigMap:any;

    construct(eb:AWS.ElasticBeanstalk, config:any, tierConfig:any, optionsConfigMap:any) {
        this.eb = eb;
        this.config = config;

        if (tierConfig === undefined) {
            debug('No tierConfig supplied, loading from config dir.');
            tierConfig = fs.readJsonSync(path.join(__dirname, '..', '..', 'config', 'eb-config-tiers.json'));
        }
        this.tierConfig = tierConfig;

        if (optionsConfigMap === undefined) {
            debug('No optionsConfigMap supplied, loading from config dir.');
            optionsConfigMap = fs.readJsonSync(path.join(__dirname, '..', '..', 'config', 'eb-config-map.json'));
        }
        this.optionsConfigMap = optionsConfigMap;
    }

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
     * Gets a config
     */
    public getEbCreateConfig() {
        return this.getLatestSolutionStack(this.config.solutionStack.os, this.config.solutionStack.stack)
            .then(function (solutionStackName) {

                var optionsSettings = [];
                var mappedOptions = EbConfig.getOptionsConfigMapped(this.config.options, this.optionsConfigMap);
                var rawOptions = this.config.rawOptions;
                optionsSettings = optionsSettings.concat(mappedOptions, rawOptions);

                return {
                    "ApplicationName": this.config.applicationName,
                    "EnvironmentName": this.config.environmentName,
                    "Description": this.config.description,
                    "CNAMEPrefix": this.config.cnamePrefix,
                    "Tier": this.getTier(this.config.tier, this.tierConfig),
                    "Tags": this.config.tags,
                    "VersionLabel": this.config.versionLabel || "{{version}}",
                    "TemplateName": this.config.templateName || null,
                    "SolutionStackName": solutionStackName,
                    "OptionSettings": [
                        {
                            "Namespace": "my:option:software",
                            "OptionName": "SQS_URL",
                            "Value": "{{sqs-queue-alert.queueUrl}}"
                        }
                    ]
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
                    EbConfig.getOptionsConfigMapped(optionsConfig[i], optionsConfigMap[i], results);
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
                results.push({
                    Namespace: 'aws:elasticbeanstalk:application:environment',
                    OptionName: optionName,
                    Value: rawOptions[optionName]
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

export = EbConfig;