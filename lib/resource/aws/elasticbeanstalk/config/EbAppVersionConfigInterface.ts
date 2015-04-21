///<reference path="../../../../../typings/vendor.d.ts" />
import ResourceConfigInterface = require('../../../config/ResourceConfigInterface');
import S3Object = require('../../s3/S3Object');

interface EbAppVersionConfigInterface extends ResourceConfigInterface {
  region: string;
  ApplicationName: string;
  VersionLabel: string;
  Description: string;
  /** The s3 object to deploy for the version */
  s3Object: S3Object;
}
export = EbAppVersionConfigInterface;