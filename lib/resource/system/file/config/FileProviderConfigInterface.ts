///<reference path="../../../../../typings/vendor.d.ts" />
import ResourceConfigInterface = require('../../../config/ResourceConfigInterface');

interface FileProviderConfigInterface extends ResourceConfigInterface {
  /** File path */
  path: string;
}
export = FileProviderConfigInterface;