///<reference path="../../../../typings/vendor.d.ts" />
import FileProviderInterface = require('./FileProviderInterface');
import FileProviderResult = require('./result/FileProviderResultInterface');
import when = require('when');
import childProcess = require('child_process');


class GitArchiveProvider implements FileProviderInterface {
  protected config:any;

  public deploy():When.Promise<FileProviderResult> {
    return when.promise<FileProviderResult>((resolve:Function, reject:Function) => {
      // Note that this will only archive the current working dir
      // More advanced git repo dir options should be implemented...
      var archive = childProcess.execSync('git archive --format=zip head', {
        cwd: process.cwd()
      });

      resolve({
        fileStream: archive
      });
    });
  }
}
export = GitArchiveProvider;