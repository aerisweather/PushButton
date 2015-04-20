///<reference path="../../../../../typings/vendor.d.ts" />
import ResourceConfigInterface = require('../../../config/ResourceConfigInterface');
import FileProvider = require('../../../system/file/FileProviderInterface');

interface BucketConfigInterface extends ResourceConfigInterface {
  name: string;
}
export = BucketConfigInterface;