///<reference path="../../../../../typings/vendor.d.ts" />
import ResourceConfigInterface = require('../../../config/ResourceConfigInterface');
import FileProvider = require('../../../system/file/FileProviderInterface');
import Bucket = require('../Bucket');

interface ObjectConfigInterface extends ResourceConfigInterface {
  fileProvider: FileProvider;
  bucket: Bucket;
  key: string;
}
export = ObjectConfigInterface;