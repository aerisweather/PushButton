/// <reference path="../../../../typings/vendor.d.ts" />

import EbLifted = require('./service/EbLifted');
import ConfigError = require('../../../error/ConfigError');
import InvalidInputError = require('../../../error/InvalidInputError');
import EbEnvironmentConfig = require('./config/EbEnvironmentConfigInterface');
import EbConfig = require('./EbConfigMapper');
import EbResult = require('./EbResult');
import ResourceInterface = require('../../ResourceInterface');
import when = require('when');
import poll = require('when/poll');
import SqsQueue = require('../sqs/SqsQueue');
import Logger = require('../../../util/Logger');


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

        Logger.trace('Creating Eb Environment "' + this.resourceConfig.environmentName +
         '" with configuration: ' + JSON.stringify(createConfig, null, 2));

        return this.eb.createEbEnvironment(createConfig);
			})
			.then((createEnvironmentResult) => {
				return new EbResult();
			});
	}

  public waitUntilReady():When.Promise<EbEnvironment> {
    const SECOND = 1000;
    const MINUTE = SECOND * 60;
    const startTime = new Date().getTime();

    var describeEnvironment = () => {
      var envName = this.resourceConfig.environmentName;
      Logger.trace('Waiting for environment ' + envName + ' to be ready...');

      return this.eb.describeEnvironments({
        ApplicationName: this.resourceConfig.applicationName,
        EnvironmentNames: [envName],
        IncludeDeleted: false
      }).then(result => result.Environments[0]);
    };
    var isReady = (description:any) => {
      const elapsedTime = new Date().getTime() - startTime;
      const elapsedMinutes = (elapsedTime / MINUTE).toFixed(2);

      Logger.trace('Current environment status is ' + description.Status +
        '. (' + elapsedMinutes + ' minutes elapsed).');

      return description.Status === 'Ready';
    };

    return poll<any>(describeEnvironment, SECOND * 10, isReady).
      timeout(MINUTE * 15).
      then(() => this);
  }

  public getQueue():When.Promise<SqsQueue> {
    const envName = this.resourceConfig.environmentName;
    return this.waitUntilReady().
      then(() => {
        Logger.trace('Fetching queue url for ' + envName);

        return this.eb.describeEnvironmentResources({
          EnvironmentName: envName
        });
      }).
      then((result:any) => {
        var queueUrl = result.EnvironmentResources.Queues[0].URL;
        Logger.trace('Queue found for environment ' + envName + ' with url: ' + queueUrl);

        return new SqsQueue({
          region: this.resourceConfig.region,
          queueUrl: queueUrl
        });
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

  public updateEnvironmentVars(environmentVars:any):When.Promise<any> {
    var updateConfig = {
      EnvironmentName: this.resourceConfig.environmentName,
      OptionSettings: EbConfig.getEnvironmentVarsMapped(environmentVars)
    };

    Logger.trace('Updating environment variables for environment ' + this.resourceConfig.environmentName +
    ': ' + JSON.stringify(environmentVars, null, 2));

    return this.eb.updateEnvironment(updateConfig).
      tap((result) => {
        Logger.trace('Environment variables updated for environment ' + this.resourceConfig.environmentName);
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