function EbConfig(eb, config, tierConfig) {
	this.eb = eb;
	this.config = config;
	this.tierConfig = tierConfig;
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

EbConfig.prototype.getTier = function(tierName) {
	return this.tierConfig[tierName];
};

EbConfig.prototype.getEbCreateConfig = function () {
	return this.getLatestSolutionStack(this.config.solutionStack.os, this.config.solutionStack.stack)
		.then(function(solutionStackName) {
			return {
				"ApplicationName":   this.config.applicationName,
				"EnvironmentName":   this.config.environmentName,
				"Description":       this.config.description,
				"CNAMEPrefix":       this.config.cnamePrefix,
				"Tier":              this.getTier(this.config.tier),
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