/// <reference path="../../../../typings/vendor.d.ts" />
import AWS = require('aws-sdk');
import ResourceInterface = require('../../ResourceInterface');
import EbAppVersionResult = require('./EbAppVersionResult');
import when = require('when');
import lift = require('../../../util/lift');

/**
 * An ElasticBeanstalk App Version, app versions may be shared across ElasticBeanstalk environments.
 */
class EbAppVersion implements ResourceInterface {

    resourceConfig:any;
    eb:AWS.ElasticBeanstalk;
    createApplicationVersion:any;

    constructor(resourceConfig) {
        this.resourceConfig = resourceConfig;
        this.eb = new AWS.ElasticBeanstalk({region: this.resourceConfig.region});
        this.createApplicationVersion = lift<any>(AWS.ElasticBeanstalk.prototype.createApplicationVersion, this.eb);
    }

    public deploy():when.Promise<EbAppVersionResult> {
        return this.createApplicationVersion({
                ApplicationName: this.resourceConfig.ApplicationName,
                VersionLabel: this.resourceConfig.VersionLabel,
                Description: this.resourceConfig.Description,
                SourceBundle: {
                    S3Bucket: this.resourceConfig.s3AppBucket.getBucketName(),
                    S3Key: this.resourceConfig.s3AppBucket.getKey()
                }
            })
            .then(function () {
                return new EbAppVersionResult(this.resourceConfig.VersionLabel);
            });
    }
}

export = EbAppVersion;