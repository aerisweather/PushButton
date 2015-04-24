///<reference path="../../typings/vendor.d.ts" />
import when = require('when');
import readline = require('readline');
import Readline = readline.ReadLine;
import _ = require('lodash');

interface FlagFinder {
  isNextArg: boolean;
  value: any;
}

class Cli {
  protected readline:Readline;

  public constructor() {
    this.readline = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  public getFlaggedArg<TValue>(...flags:string[]):TValue {
    var flagFinder:FlagFinder;

    flagFinder = process.argv.
      reduce<FlagFinder>((flagFinder:FlagFinder, arg:any) => {
      return {
        // If this arg is the flag, our next arg will be the value
        isNextArg: _.contains(flags, arg),
        // If the last arg was a flag, this arg is the value
        value: flagFinder.isNextArg ? arg : flagFinder.value
      };
    }, {
      isNextArg: false,
      value: null
    });

    return flagFinder.value;
  }

  public ask(question:string, defaultValue:any = null):When.Promise<any> {
    if (defaultValue !== null) {
      question += ' [' + defaultValue + ']';
    }
    question += ': ';

    return when.promise((resolve, reject) => {
      this.readline.question(question + ': ', (answer:any) => {
        if (!answer) {
          if (defaultValue === null) {
            // ask again...
            resolve(this.ask(question));
            return;
          }
          resolve(defaultValue);
          return;
        }

        resolve(answer);
      });
    });
  }
}
export = Cli;