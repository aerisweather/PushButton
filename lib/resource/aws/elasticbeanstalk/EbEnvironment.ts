/// <reference path="../../../../typings/vendor.d.ts" />

import EbLifted = require('./service/EbLifted');
import ConfigError = require('../../../error/ConfigError');
import InvalidInputError = require('../../../error/InvalidInputError');
import EbEnvironmentConfig = require('./config/EbEnvironmentConfigInterface');
import EbConfig = require('./EbConfigMapper');
import EbResult = require('./EbResult');
import ResourceInterface = require('../../ResourceInterface');
import when = require('when');


/**
 * A single deployable elastic beanstalk environment.
 */
class EbEnvironment implements ResourceInterface {
	protected resourceConfig:EbEnvironmentConfig;
	protected eb:EbLifted;

	constructor (resourceConfig:EbEnvironmentConfig) {
		this.resourceConfig = resourceConfig;
		if (this.resourceConfig.appVersion === undefined) {
			throw new ConfigError('EB -> appVersion', 'An appVersion must be passed to an ElasticBeanstalk resource, this should reference an ElasticBeanstalk AppVersion resource.');
		}
		this.eb = new EbLifted({region: this.resourceConfig.region});
	}

	public createResource ():when.Promise<EbResult> {
		var ebConfig:EbConfig = new EbConfig(this.eb);

		return ebConfig.getEbCreateConfig(this.resourceConfig)
			.tap((createConfig) => {
				//Validate application name.
				return this.validateApplicationName(createConfig.ApplicationName)
			})
			.then((createConfig) => {
				//AppVersion referenced by this.resourceConfig.appVersion
				createConfig.VersionLabel = this.resourceConfig.appVersion.getVersionLabel();
				return this.eb.createEbEnvironment(createConfig);
			})
			.then((createEnvironmentResult) => {
				return new EbResult();
			});
	}

	public updateResource ():when.Promise<EbResult> {
		var ebConfig:EbConfig = new EbConfig(this.eb);
		return ebConfig.getEbCreateConfig(this.resourceConfig)
			.tap((createConfig) => {
				//Validate application name.
				return this.validateApplicationName(createConfig.ApplicationName)
			})
			.tap((createConfig) => {
				//Validate environment name.
				return this.validateEnvironmentName(createConfig.EnvironmentName)
			})
			.then((createConfig) => {

				return this.eb.describeEnvironmentOptions({EnvironmentName: createConfig.EnvironmentName}).
					then(function (envOptions) {
						//Find old options that aren't on the new config, place them in the Options to remove section.

					})
			});

	}

	public validateApplicationName (applicationName:string):when.Promise<boolean> {
		return this.eb.describeApplications({})
			.then(function (data) {
				if (data.Applications) {
					var validApplications = data.Applications.filter(function (appData) {
						return appData.ApplicationName === applicationName;
					});
					if (validApplications.length === 1) {
						return true;
					}
					else {
						var availableApplications = data.Applications.map(function (appData) {
							return appData.ApplicationName;
						});

						throw new InvalidInputError('application', "Application was not found for this account. Try one of the following: \n\t\t" + availableApplications.join("\n\t\t"));
					}
				}
				return false;
			});
	}

	public validateEnvironmentName (environmentName:string):when.Promise<boolean> {
		return this.eb
			.describeEnvironments({
				EnvironmentName: environmentName
			})
			.then(function (environmentData) {
				//If we have any data that means the service is up and running.
				return (environmentData.Environments.length !== 0);
			});
	}
}

export = EbEnvironment;