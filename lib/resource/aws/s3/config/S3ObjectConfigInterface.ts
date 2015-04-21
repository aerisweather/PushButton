///<reference path="../../../../../typings/vendor.d.ts" />
import ResourceConfigInterface = require('../../../config/ResourceConfigInterface');
import FileProvider = require('../../../system/file/FileProviderInterface');
import Bucket = require('../S3Bucket');

interface S3ObjectConfigInterface extends ResourceConfigInterface {
  fileProvider: FileProvider;
  bucket: Bucket;
  key: string;
}
export = S3ObjectConfigInterface;