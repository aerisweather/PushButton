///<reference path="../../../../typings/vendor.d.ts" />
import FileProviderInterface = require('./FileProviderInterface');
import FileProviderResult = require('./result/FileProviderResultInterface');
import FileProviderConfig = require('./config/FileProviderConfigInterface');
import when = require('when');
import nodeFn = require('when/node');
import fs = require('fs');

class FileProvider implements FileProviderInterface {
  protected config:FileProviderConfig;

  public constructor(config:FileProviderConfig) {
    this.config = config;
  }

  public createResource():When.Promise<FileProviderResult> {
    return when.promise<FileProviderResult>((resolve, reject) => {
      resolve({
        message: 'Created stream for file at ' + this.config.path,
        fileStream: fs.createReadStream(this.config.path, {
          flags:'r'
        })
      });
    });
  }

}
export = FileProvider;