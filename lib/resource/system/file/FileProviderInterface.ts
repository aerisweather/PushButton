///<reference path="../../../../typings/vendor.d.ts" />
import ResourceInterface = require('../../ResourceInterface');
import FilerProviderResult = require('./result/FileProviderResultInterface');

interface FileProviderInterface extends ResourceInterface {
  createResource():When.Promise<FilerProviderResult>;
}
export = FileProviderInterface;