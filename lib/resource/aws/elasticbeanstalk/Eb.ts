/// <reference path="../../../../typings/vendor.d.ts" />

import AWS = require('aws-sdk');
import InvalidInputError = require('../../../error/InvalidInputError');
import EbResult = require('./EbResult');
import ResourceInterface = require('../../ResourceInterface');
import when = require('when');

class ElasticBeanstalk implements ResourceInterface {

    config:any;
    eb:AWS.ElasticBeanstalk;

    constructor(resourceConfig) {
        this.config = resourceConfig;
        this.eb = new AWS.ElasticBeanstalk({region: this.config.region});
    }

    public deploy():EbResult {
        return new EbResult();
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