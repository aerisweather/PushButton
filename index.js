///<reference path="./typings/vendor.d.ts" />
var AdmiralCli = require('admiral-cli');
var Debug = require('debug');
var fs = require('fs-extra');
var readline = require('readline');
var ResourceCollection = require('./lib/resource/ResourceCollection');
var debug = Debug('main');
/*
 * Run Example:
 *
 * push-button -a turbine -e staging
 */
var cli = new AdmiralCli();
cli
    .option('configPath', 'The path to the configuration', '-c', '--config-path', 'string', 1);
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
var config = fs.readJsonSync(cli.params.configPath);
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
function quit() {
    console.log('Deployment successful');
    process.exit(0);
}
function fail(err) {
    console.error(err);
    process.exit(1);
}
//# sourceMappingURL=index.js.map