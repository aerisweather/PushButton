///<reference path="./typings/vendor.d.ts" />
var AdmiralCli = require('admiral-cli');
var fs = require('fs-extra');
var glob = require('glob');
var InvalidInputError = require('./lib/error/InvalidInputError');
var path = require('path');
var readline = require('readline');
var ResourceCollection = require('./lib/resource/ResourceCollection');
var debug = debug('main');
/*
 * Run Example:
 *
 * push-button -a turbine -e staging
 */
var cli = new AdmiralCli.Cli();
cli
    .commandGroup('command', 'What we are going to do with deployment', [
    new AdmiralCli.CliCommand('deploy', 'Deploy a new environment'),
    new AdmiralCli.CliCommand('promote', 'Apply a new config to an existing environment')
])
    .option('application', 'Which application we should deploy', '-a', '--application', 'string', 1)
    .option('environment', 'Which environment config to use when deploying', '-e', '--environment', 'string', 1)
    .option('resource', 'The specific resource to deploy', '-r', '--resource', 'string')
    .option('configDir', 'A path to the JSON formatted config, may be a directory.', '-c', '--config-dir', 'string', 1);
//Parse Cli arguments 
try {
    cli.parse();
}
catch (error) {
    console.error(error);
    if (error instanceof AdmiralCli.InvalidInputError) {
        process.exit(2);
    }
    else if (error instanceof AdmiralCli.ConfigError) {
        console.error('Doh, configured something wrong.', error);
        process.exit(1);
    }
}
var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
//Application Start
var config = getConfig(cli.params.configDir, cli.params.application, cli.params.environment);
rl.question("What version are you deploying? (ex. v1.2.3) : ", function (answer) {
    config.params.version = answer;
    var rc = new ResourceCollection(config);
    rc.on('deploy', function (result, resource) {
        console.log(result.message);
    });
    rc.on('error', function (error, resource) {
        console.error(error);
    });
    //Run!
    rc.createResource().
        done(quit, fail);
});
function getConfig(configDir, applicationName, environment) {
    var configPath = path.resolve(configDir);
    if (fs.lstatSync(configPath).isDirectory()) {
        //Search directory for json files
        var paths = glob.sync(path.join(configPath, '*.json'));
        //Parse configs
        var configs = paths.map(function (configPath) {
            debug('- Testing config: ' + configPath);
            return fs.readJsonSync(configPath);
        });
        //Check configs against our requested config, select a config that matches this application and environment.
        var foundConfigs = configs.filter(function (singleConfig) {
            return (singleConfig.application === applicationName && singleConfig.environment === environment);
        });
        if (foundConfigs.length === 1) {
            return foundConfigs[0];
        }
        else {
            throw new InvalidInputError('config-dir', "Could not find a config that matched application: " + applicationName + ", environment: " + environment);
        }
    }
    else {
        //It is a single file or doesn't exist.
        debug('Checking for single config file.');
        try {
            return fs.readJsonSync(configPath);
        }
        catch (err) {
            throw new InvalidInputError('config-dir', "The config-dir can be a path to a json file or a directory, could not resolve: " + configPath + " to a valid JSON file");
        }
    }
}
function quit() {
    console.log('Deployment successful');
    process.exit(0);
}
function fail(err) {
    console.error(err);
    process.exit(1);
}
//# sourceMappingURL=index.js.map