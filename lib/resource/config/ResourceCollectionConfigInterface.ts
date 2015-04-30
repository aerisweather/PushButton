import ResourceConfigInterface = require('./ResourceConfigInterface');
import ResourceServiceConfig = require('../../config-manager/config/ResourceServiceConfigInterface');

interface ResourceCollectionConfigInterface {
  /** Paths to other configs to import */
  imports?:string[]
  params?:any;
  resources:ResourceServiceConfig[];
}
export = ResourceCollectionConfigInterface;