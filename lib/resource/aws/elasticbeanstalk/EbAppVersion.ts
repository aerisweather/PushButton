/// <reference path="../../../../typings/vendor.d.ts" />
import AWS = require('aws-sdk');
import ResourceInterface = require('../../ResourceInterface');
import EbAppVersionConfig = require('./config/EbAppVersionConfigInterface');
import EbAppVersionResult = require('./EbAppVersionResult');
import when = require('when');
import lift = require('../../../util/lift');

/**
 * An ElasticBeanstalk App Version, app versions may be shared across ElasticBeanstalk environments.
 */
class EbAppVersion implements ResourceInterface {

  protected resourceConfig:EbAppVersionConfig;
  protected eb:AWS.ElasticBeanstalk;
  protected createApplicationVersion:(params:any) => When.Promise<any>;

  constructor(resourceConfig:EbAppVersionConfig) {
    this.resourceConfig = resourceConfig;
    this.eb = new AWS.ElasticBeanstalk({region: this.resourceConfig.region});
    this.createApplicationVersion = lift<any>(AWS.ElasticBeanstalk.prototype.createApplicationVersion, this.eb);
  }

  public deploy():when.Promise<EbAppVersionResult> {
    return this.createApplicationVersion({
      ApplicationName: this.resourceConfig.ApplicationName,
      VersionLabel: this.resourceConfig.VersionLabel,
      Description: this.resourceConfig.Description,
      SourceBundle: this.resourceConfig.s3Object.getSourceBundle()
    })
      .then(function () {
        return new EbAppVersionResult(this.resourceConfig.VersionLabel);
      });
  }
}

export = EbAppVersion;