/// <reference path="../../../../typings/vendor.d.ts" />

import AWS = require('aws-sdk');
import ConfigError = require('../../../error/ConfigError');
import debugMod = require('debug');
import fs = require('fs-extra');
import EbOption = require('./config/EbOptionInterface');
import path = require('path');
import when = require('when');
import _ = require('lodash');
import EbEnvironmentConfig = require('./config/EbEnvironmentConfigInterface');
import SqsQueue = require('../sqs/SqsQueue');
import EbParams = AWS.ElasticBeanstalk.Params;
import EbLifted = require('./service/EbLifted');

var debug = debugMod('EbConfigMapper');

class EbConfigMapper {

	protected eb:EbLifted;
	protected config:any;
	protected tierConfig:any;
	protected optionsConfigMap:any;

	public constructor (eb?:EbLifted, tierConfig?:any, optionsConfigMap?:any) {
		this.eb = eb;

		if (!tierConfig) {
			debug('No tierConfig supplied, loading from config dir.');
			tierConfig = require('../../../../config/eb-config-tiers.json');
		}
		this.tierConfig = tierConfig;

		if (!optionsConfigMap) {
			debug('No optionsConfigMap supplied, loading from config dir.');
			optionsConfigMap = require('../../../../config/eb-config-map.json');
		}
		this.optionsConfigMap = optionsConfigMap;
	}

	/**
	 *
	 * @param os
	 * @param solutionStackShortName
	 * @returns {Promise<string>}
	 */
	public getLatestSolutionStack (os, solutionStackShortName):when.Promise<string> {
		return this.eb.listAvailableSolutionStacks()
			.then(function (stackResult) {
				if (stackResult.SolutionStacks && stackResult.SolutionStacks.length) {
					for (var i = 0; i < stackResult.SolutionStacks.length; i++) {
						var solutionStackName = stackResult.SolutionStacks[i];
						if (solutionStackName.indexOf(os) !== -1 && solutionStackName.indexOf(solutionStackShortName) !== -1) {
							return solutionStackName;
						}
					}
				}
				throw new Error("Couldn't find a solution for the requested stack: " + os + " running " + solutionStackShortName);
			});
	}

	/**
	 * Get EbCreate Config
	 *
	 * Gets a config ready for AWS ElasticBeanstalk createEnvironment.
	 */
	public getEbCreateConfig (config:EbEnvironmentConfig):When.Promise<AWS.ElasticBeanstalk.Params.createEnvironment> {
		return this.getLatestSolutionStack(config.solutionStack.os, config.solutionStack.stack)
			.tap(function () {
				handleSqsWorker(config);
			})
			.then((solutionStackName) => {
				var optionsSettings = getAllOptions(config, this.optionsConfigMap);

				var ebParams:EbParams.createEnvironment = {
					"ApplicationName": config.applicationName,
					"EnvironmentName": config.environmentName,
					"Description": config.description,
					"CNAMEPrefix": config.cnamePrefix,
					"Tier": EbConfigMapper.getTier(config.tier, this.tierConfig),
					"Tags": config.tags,
					"TemplateName": config.templateName || null,
					"SolutionStackName": solutionStackName,
					"OptionSettings": optionsSettings
				};
				// Remove null values
				ebParams = _.pick<any, any>(ebParams, (val, key) => !_.isNull(val) && !_.isUndefined(val));
				return <EbParams.createEnvironment>ebParams;
			});
	}

	/**
	 * Get Options Config, Mapped
	 *
	 * Maps options in the user friendly config way to the Elastic Beanstalk EbOptions array
	 */
	public static getOptionsConfigMapped (optionsConfig:any, optionsConfigMap:any, results?:Array<EbOption>):Array<EbOption> {
		if (results === undefined) {
			results = [];
		}

		_.each(optionsConfig, (optionVal, key) => {
			var mappedVal = optionsConfigMap[key];
			if (_.isObject(optionVal)) {
				EbConfigMapper.getOptionsConfigMapped(optionVal, mappedVal, results);
			}
			else if (mappedVal) {
				var keyParts = mappedVal.split('.');
				var namespace = keyParts[0];
				var optionName = keyParts[1];
				results.push({
					Namespace: namespace,
					OptionName: optionName,
					Value: <string>_.result(optionsConfig, key)
				});
			}
			else {
				throw new ConfigError('options -> ' + key,
					"Couldn't find map for option key " + key +
					", are you sure this is a valid key for the options config?");
			}
		});

		return results;
	}

	/**
	 * Get Raw Options, Mapped
	 *
	 * Maps raw options to the Elastic Beanstalk friendly EbOptions array
	 */
	public static getRawOptionsMapped (rawOptions:Dictionary<any>):Array<EbOption> {
		var results = [];
		_.each(rawOptions, function (value, optionName) {
			var keyParts = optionName.split('.');
			var namespace = keyParts[0];
			var optionName = keyParts[1];
			results.push({
				Namespace: namespace,
				OptionName: optionName,
				Value: <string>_.result(rawOptions, optionName)
			});
		});
		return results;
	}

	/**
	 * Get Environment Variable Options, Mapped
	 *
	 * Maps Environment Options to the Elastic Beanstalk friendly EbOptions array
	 */
	public static getEnvironmentVarsMapped (envVarOptions:Dictionary<any>):Array<EbOption> {
		var results = [];

		_.each(envVarOptions, function (value, optionName) {
			results.push({
				Namespace: 'aws:elasticbeanstalk:application:environment',
				OptionName: optionName,
				Value: <string>_.result(envVarOptions, optionName)
			});
		});
		return results;
	}

	/**
	 * Get Tier
	 *
	 * Gets a tier config name and passed config.
	 */
	public static getTier (tierName:string, tierConfig:any):any {
		var result = tierConfig[tierName];
		if (result === undefined) {
			throw new ConfigError('tier', tierName + " is an invalid tier and the configuration couldn't be found for that tier.");
		}
		return result;
	}
}

function getAllOptions (config, optionsConfigMap) {
	var optionsSettings = [];
	var mappedOptions = [];
	var rawOptions = [];
	var envVars = [];

	if (config.options) {
		mappedOptions = EbConfigMapper.getOptionsConfigMapped(config.options, optionsConfigMap);
	}
	if (config.rawOptions) {
		rawOptions = EbConfigMapper.getRawOptionsMapped(config.rawOptions);
	}
	if (config.environmentVars) {
		envVars = EbConfigMapper.getEnvironmentVarsMapped(config.environmentVars);
	}
	return optionsSettings.concat(mappedOptions, rawOptions, envVars);
}

/**
 * Handle SQS Worker
 *
 * EBEnvironments need an SQS Worker if and only if they are a worker class. Validate that for us.
 */
function handleSqsWorker (config:EbEnvironmentConfig):when.Promise<EbEnvironmentConfig> {
  var hasSqsQueueResource = config.options.sqsWorker && config.options.sqsWorker.sqsQueue;

  config.options || (config.options = {});

  // Only worker environments may configure an sqs queue
  if (config.options.sqsWorker && config.tier !== "Worker") {
    throw new ConfigError('EB.options.sqsWorker', "An ElasticBeanstalk Environment that is NOT a worker tier has options.sqsWorker, this should be removed");
  }

	if (hasSqsQueueResource) {
    // Set the Worker Environement sqsQueue,
    // as configured.
		return config.options.sqsWorker.sqsQueue.
      getQueueUrl().
			then((queueUrl) => {
				delete config.options.sqsWorker.sqsQueue;
				config.options.sqsWorker.queueUrl = queueUrl;

				return config;
			});
	}

	return when(config);
}
export = EbConfigMapper;