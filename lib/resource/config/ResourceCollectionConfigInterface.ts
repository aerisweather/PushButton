import ResourceConfigInterface = require('./ResourceConfigInterface');
import ResourceServiceConfig = require('../../config-manager/config/ResourceServiceConfigInterface');

interface ResourceCollectionConfigInterface {
  params?:any;
  resources:ResourceServiceConfig[];
}
export = ResourceCollectionConfigInterface;