///<reference path="./typings/vendor.d.ts" />

import AdmiralCli = require('admiral-cli');
import ConfigError = require('./lib/error/ConfigError');
import fs = require('fs-extra');
import path = require('path');
import glob = require('glob');
import InvalidInputError = require('./lib/error/InvalidInputError');
import readline = require('readline');
import ResourceCollection = require('./lib/resource/ResourceCollection');
import when = require('when');
import sequence = require('when/sequence');

/*
 * Run Example:
 *
 * push-button -a turbine -e staging
 */

interface PushButtonArg {
  param: string;
  description: string;
  flag: string;
  type: string;
}

class PushButton {
  protected cli:Admiral.Cli;
  protected rl:readline.ReadLine;
  protected config:any;

  public constructor() {
    this.cli = new AdmiralCli({
      helpOnNoArgs: false
    });
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  public run() {
    return this.loadConfig().
      tap((config) => this.config = config).
      then((config) => this.parseArgs(config.args)).
      then(() => this.deployResources());
  }

  protected loadConfig():When.Promise<any> {
    var configPath = process.argv.reduce((memo:any, arg:any) => {
      return {
        isNextArg: arg === '-c' || arg == '--config-path',
        value: memo.isNextArg ? arg : memo.value
      };
    }, {})['value'];

    // We have to tell Admiral CLI about the -c flag,
    // even if we aren't using Admiral to grab it
    // (otherwise it will complain)
    this.cli.option('configPath', 'PushButton.json config file path', '-c', '--configPath', 'string');

    if (configPath) {
      return when(fs.readJsonSync(configPath));
    }
    return when(fs.readJsonSync(path.join(process.cwd(), 'PushButton.json')));
  }

  protected parseCliOptions():When.Promise<any> {
    return when.promise(
      (resolve, reject) => {
        try {
          this.cli.parse();
          resolve(this.cli.params);
        }
        catch (err) {
          reject(err);
        }
      }).
      catch(AdmiralCli.InvalidInputError, (err) => {
        console.error(err);
        process.exit(2);
        return err;
      }).
      catch(AdmiralCli.ConfigError, (err) => {
        console.error('Doh, configured something wrong.', err);
        process.exit(1);
        return err;
      });
  }

  protected parseArgs(args:PushButtonArg[]) {
    var mapAsync = <any>when['map'];

    // Setup options for each arg
    args.forEach((arg:PushButtonArg) => {
      this.cli.option(arg.param, arg.description, arg.flag, arg.flag, arg.type);
    });

    return this.parseCliOptions().
      then((options:any) => {
        return mapAsync(args, (arg:PushButtonArg) => {
          return this.getArg(arg).
            tap((argValue) => {
              this.config.params[arg.param] = argValue;
            });
        });
      });
  }

  protected getArg(arg:PushButtonArg):When.Promise<any> {
    // Try in cli params, first
    if (this.cli.params[arg.param]) {
      return when(this.cli.params[arg.param][0]);
    }

    return this.ask(arg.description);
  }

  protected ask(question:string):When.Promise<any> {
    return when.promise((resolve, reject) => {
      this.rl.question(question + ': ', (answer:any) => {
        resolve(answer)
      });
    });
  }

  protected deployResources() {
    var rc = new ResourceCollection(this.config);

    rc.on('deploy', function (result, resource) {
      console.log(result.message);
    });

    rc.on('error', function (error, resource) {
      console.error(error);
    });

    //Run!
    rc.createResource().
      done(quit, fail);
  }
}

var pb = new PushButton();
pb.run();


function quit() {
  console.log('Deployment successful');
  process.exit(0);
}

function fail(err) {
  console.error(err);
  process.exit(1);
}


