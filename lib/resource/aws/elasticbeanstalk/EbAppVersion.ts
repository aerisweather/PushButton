/// <reference path="../../../../typings/vendor.d.ts" />
import AWS = require('aws-sdk');
import ResourceInterface = require('../../ResourceInterface');
import EbAppVersionResult = require('./EbAppVersionResult');
import when = require('when');
import whenNodeLift = require('when/node');

AWS.ElasticBeanstalk.createApplicationVersion = whenNodeLift.lift(AWS.ElasticBeanstalk.createApplicationVersion);

/**
 * An ElasticBeanstalk App Version, app versions may be shared across ElasticBeanstalk environments.
 */
class EbAppVersion implements ResourceInterface {

    resourceConfig:any;
    eb:AWS.ElasticBeanstalk;

    constructor(resourceConfig) {
        this.resourceConfig = resourceConfig;
        this.eb = new AWS.ElasticBeanstalk({region: this.resourceConfig.region});
    }

    public deploy():when.Promise<EbAppVersionResult> {
        return this.eb
            .createApplicationVersion({
                ApplicationName: this.resourceConfig.ApplicationName,
                VersionLabel: this.resourceConfig.VersionLabel,
                Description: '[Push-Button] App Version Description.',
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