///<reference path="../../../../../typings/vendor.d.ts" />
import ResultInterface = require('../../../result/ResultInterface');
import fs = require('fs');

interface FileProviderResultInterface extends ResultInterface {
  fileStream: fs.ReadStream;
}
export = FileProviderResultInterface;