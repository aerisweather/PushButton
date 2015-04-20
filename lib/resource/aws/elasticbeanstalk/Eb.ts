/// <reference path="../../../../typings/vendor.d.ts" />

import AWS = require('aws-sdk');
import InvalidInputError = require('../../../error/InvalidInputError');
import EbConfig = require('./EbConfig');
import EbResult = require('./EbResult');
import ResourceInterface = require('../../ResourceInterface');
import when = require('when');
import whenNodeLift = require('when/node');



/**
 * A single deployable elastic beanstalk environment.
 */
class ElasticBeanstalk implements ResourceInterface {

    resourceConfig:any;
    eb:AWS.ElasticBeanstalk;

    constructor(resourceConfig) {
        this.resourceConfig = resourceConfig;
        this.eb = new AWS.ElasticBeanstalk({region: this.resourceConfig.region});
    }

    public deploy():when.Promise<EbResult> {

        var ebConfig = new EbConfig(this.eb);

        var parsedCreateConfig;
        return ebConfig.getEbCreateConfig(this.resourceConfig.config)
            .tap(function (createConfig) {
                //Application code already exists on S3, we have a reference to that S3 bucket

                //Create appVersion

            }.bind(this))
            .then(function (createConfig) {
                return this.eb.createEnvironment(createConfig);
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