///<reference path="../../../typings/vendor.d.ts" />
import ResultInterface = require('../result/ResultInterface');
import fs = require('fs');

interface FileResultInterface extends ResultInterface {
    stream:fs.ReadStream;
}
export = FileResultInterface;