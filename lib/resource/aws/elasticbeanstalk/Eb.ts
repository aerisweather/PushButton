/// <reference path="../../../../typings/vendor.d.ts" />

import AWS = require('aws-sdk');
import ConfigError = require('../../../error/ConfigError');
import InvalidInputError = require('../../../error/InvalidInputError');
import EbConfig = require('./EbConfig');
import EbResult = require('./EbResult');
import ResourceInterface = require('../../ResourceInterface');
import when = require('when');
import lift = require('../../../util/lift');

/**
 * A single deployable elastic beanstalk environment.
 */
class ElasticBeanstalk implements ResourceInterface {

    resourceConfig:any;
    eb:AWS.ElasticBeanstalk;
    createEbEnvironment:any;

    constructor(resourceConfig) {
        this.resourceConfig = resourceConfig;
        if (this.resourceConfig.appVersion === undefined) {
            throw new ConfigError('EB -> appVersion', 'An appVersion must be passed to an ElasticBeanstalk resource, this should reference an ElasticBeanstalk AppVersion resource.');
        }
        this.eb = new AWS.ElasticBeanstalk({region: this.resourceConfig.region});
        this.createEbEnvironment = lift<any>(AWS.ElasticBeanstalk.prototype.createApplication, this.eb);
    }

    public deploy():when.Promise<EbResult> {

        var ebConfig = new EbConfig(this.eb);

        return ebConfig.getEbCreateConfig(this.resourceConfig.config)
            .then(function (createConfig) {
                //AppVersion referenced by this.resourceConfig.appVersion
                createConfig.VersionLabel = this.resourceConfig.appVersion.versionLabel;
                return this.createEbEnvironment(createConfig);
            })
            .then(function (createEnvironmentResult) {
                return new EbResult();
            });
    }

    public validateApplicationName(applicationName:string):when.Promise<boolean> {
        return when.promise<boolean>(function (resolve, reject) {
            this.eb.describeApplications({}, function (err, data) {
                if (err) {
                    reject(err);
                    return false;
                } // an error occurred
                else {
                    if (data.Applications) {
                        var validApplications = data.Applications.filter(function (appData) {
                            return appData.ApplicationName === applicationName;
                        });
                        if (validApplications.length === 1) {
                            resolve(true);
                            return false;
                        }
                        else {
                            var availableApplications = data.Applications.map(function (appData) {
                                return appData.ApplicationName;
                            });

                            reject(new InvalidInputError('application', "Application was not found for this account. Try one of the following: \n\t\t" + availableApplications.join("\n\t\t")));
                        }
                    }
                    resolve(false);
                }
            });
        });
    }
}

export = ElasticBeanstalk;