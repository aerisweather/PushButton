///<reference path="../../../../typings/vendor.d.ts" />
import FileProviderInterface = require('./FileProviderInterface');
import FileProviderResult = require('./result/FileProviderResultInterface');
import when = require('when');
import childProcess = require('child_process');
import Logger = require('../../../util/Logger');


class GitArchiveProvider implements FileProviderInterface {
  protected config:any;

  public createResource():When.Promise<FileProviderResult> {
    return when.promise<FileProviderResult>((resolve:Function, reject:Function) => {
      var archive;

      Logger.trace('Creating git archive from ' + process.cwd());

      // Note that this will only archive the current working dir
      // More advanced git repo dir options should be implemented...
      archive = childProcess.execSync('git archive --format=zip HEAD', {
        cwd: process.cwd()
      });

      Logger.trace('Successfully created git archive.');

      resolve({
        message: 'Successfully archived git repo at ' + process.cwd(),
        fileStream: archive
      });
    });
  }
}
export = GitArchiveProvider;