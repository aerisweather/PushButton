///<reference path="../../typings/vendor.d.ts" />
import ResourceCollectionConfigInterface = require('../resource/config/ResourceCollectionConfigInterface');
import PushButtonArg = require('./PushButtonArgInterface');

interface PushButtonConfigInterface extends ResourceCollectionConfigInterface {
  args?:PushButtonArg[];
  /** Paths to other configs to import */
  imports?:string[]
}
export = PushButtonConfigInterface;