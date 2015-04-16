var Cli = require('admiral-cli'),
	CliCommand = require('admiral-cli').Command,
	CliInvalidInputError = require('admiral-cli').InvalidInputError,
	CliConfigError = require('admiral-cli').ConfigError,
	ConfigError = require('./lib/error/ConfigError'),
	debug = require('debug')('main'),
	fs = require('fs-extra'),
	glob = require('glob'),
	InvalidInputError = require('./lib/error/InvalidInputError'),
	path = require('path'),
	whenPipeline = require('when/pipeline');

/*
 * Run Example:
 *
 * push-button -a turbine -e staging
 */

var cli = new Cli();
cli
	.commandGroup('command', 'What we are going to do with deployment', [
		new CliCommand('deploy', 'Deploy a new environment'),
		new CliCommand('promote', 'Apply a new config to an existing environment')
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
	if (error instanceof CliInvalidInputError) {
		process.exit(2);
	}
	else if (error instanceof CliConfigError) {
		console.error('Doh, configured something wrong.', error);
		process.exit(1);
	}
}

console.log(cli.params);


//Cut below here
var ElasticBeanstalk = require('./lib/eb/ElasticBeanstalk');

var config = getConfig(cli.params.configDir, cli.params.application, cli.params.environment);

if(config.resources && config.resources.length) {
	var awsServices = config.resources.map(function(resourceConfig) {
		var service = AwsServiceFactory.getAwsService(resourceConfig);
		return service.deploy;
	});
	whenPipeline(awsServices)
		.then(function(results) {
			//done?
		});
}
else {
	throw new ConfigError('resources', 'Must be an array with at least one resource to deploy');
}

var eb = new ElasticBeanstalk(config.region);
eb.validateApplicationName(cli.params.application)
	.then(function (result) {
		//Checked application was valid
		debug('Application by the name: ' + cli.params.application + ' was found');
	})
	.then(function () {
		console.log(config);
	})
	.catch(function (err) {
		console.error(err.stack);
	});

function getConfig(configDir, applicationName, environment) {
	var configPath = path.resolve(configDir);

	if(fs.lstatSync(configPath).isDirectory()) {
		//Search directory for json files
		var paths = glob.sync(path.join(configPath, '*.json'));
		//Parse configs
		var configs = paths.map(function(configPath) {
			debug('- Testing config: ' + configPath);
			return fs.readJsonSync(configPath);
		});
		//Check configs against our requested config, select a config that matches this application and environment.
		var foundConfigs = configs.filter(function(singleConfig) {
			return (singleConfig.application === applicationName && singleConfig.environment === environment);
		});

		if(foundConfigs.length === 1) {
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
		catch(err) {
			throw new InvalidInputError('config-dir', "The config-dir can be a path to a json file or a directory, could not resolve: " + configPath + " to a valid JSON file");
		}
	}
}


