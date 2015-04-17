var debug = require('debug')('EbConfig'),
	ConfigError = require('../error/ConfigError'),
	fs = require('fs-extra'),
	path = require('path');

function EbConfig(eb, config, tierConfig, optionsConfigMap) {
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

EbConfig.prototype.getLatestSolutionStack = function (os, solutionStackShortName) {
	return new Promise(function (resolve, reject) {
		this.eb.listAvailableSolutionStacks(function (err, stackResult) {
			if (err) {
				reject(err);
				return;
			}
			if (stackResult.SolutionStacks && stackResult.SolutionStacks.length) {
				for (var i = 0; i < stackResult.SolutionStacks.length; i++) {
					var solutionStackName = stackResult.SolutionStacks[i];
					if (solutionStackName.indexOf(os) !== -1 && solutionStackName.indexOf(solutionStackShortName) !== -1) {
						resolve(solutionStackName);
						return;
					}
				}
			}
			reject(new Error("Couldn't find a solution for the requested stack: " + os + " running " + solutionStackShortName));
		});
	}.bind(this));
};

EbConfig.getTier = function (tierName, tierConfig) {
	var result = tierConfig[tierName];
	if (result === undefined) {
		throw new ConfigError('tier', tierName + " is an invalid tier and the configuration couldn't be found for that tier.");
	}
	return result;
};

EbConfig.getOptionsConfigMapped = function (optionsConfig, optionsConfigMap, results) {
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
						Namespace:  namespace,
						OptionName: optionName,
						Value:      value
					});
				}
				else {
					throw new ConfigError('options -> ' + i, "Couldn't find map for option key " + i + ", are you sure this is a valid key for the options config?");
				}
			}
		}
	}
	return results;
};

EbConfig.prototype.getEbCreateConfig = function () {
	return this.getLatestSolutionStack(this.config.solutionStack.os, this.config.solutionStack.stack)
		.then(function (solutionStackName) {

			var optionsSettings = [];
			var mappedOptions = EbConfig.getOptionsConfigMapped(this.config.options, this.optionsConfigMap);

			return {
				"ApplicationName":   this.config.applicationName,
				"EnvironmentName":   this.config.environmentName,
				"Description":       this.config.description,
				"CNAMEPrefix":       this.config.cnamePrefix,
				"Tier":              this.getTier(this.config.tier, this.tierConfig),
				"Tags":              this.config.tags,
				"VersionLabel":      this.config.versionLabel || "{{version}}",
				"TemplateName":      this.config.templateName || null,
				"SolutionStackName": solutionStackName,
				"OptionSettings":    [
					{
						"Namespace":  "my:option:software",
						"OptionName": "SQS_URL",
						"Value":      "{{sqs-queue-alert.queueUrl}}"
					}
				]
			}
		}.bind(this));
};

module.exports = EbConfig;