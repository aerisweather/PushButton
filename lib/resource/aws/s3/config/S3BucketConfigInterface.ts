///<reference path="../../../../../typings/vendor.d.ts" />
import ResourceConfigInterface = require('../../../config/ResourceConfigInterface');
import FileProvider = require('../../../system/file/FileProviderInterface');

interface S3BucketConfigInterface extends ResourceConfigInterface {
  bucketName: string;
}
export = S3BucketConfigInterface;