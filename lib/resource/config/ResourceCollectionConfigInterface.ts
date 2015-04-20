import ResourceConfigInterface = require('./ResourceConfigInterface');

interface ResourceCollectionConfigInterface {
  params?:any;
  resources:ResourceConfigInterface[];
}
export = ResourceCollectionConfigInterface;