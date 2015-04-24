///<reference path="../../typings/vendor.d.ts" />
import ResourceCollectionConfigInterface = require('../resource/config/ResourceCollectionConfigInterface');
import PushButtonArg = require('./PushButtonArgInterface');

interface PushButtonConfigInterface extends ResourceCollectionConfigInterface {
  args?:PushButtonArg[];
}
export = PushButtonConfigInterface;