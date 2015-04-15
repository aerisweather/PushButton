var Cli = require('admiral-cli'),
	CliCommand = require('admiral-cli').Command,
	CliInvalidInputError = require('admiral-cli').InvalidInputError,
	CliConfigError = require('admiral-cli').ConfigError;

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
	.option('resource', 'The specific resource to deploy', '-r', '--resource', 'string');

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
var ElasticBeanstalk = require('./lib/ElasticBeanstalk');

var eb = new ElasticBeanstalk();
eb.validateApplicationName(cli.params.application)
.then(function(result) {
		if(result) {
			console.log('Application was found');
		}
		else {
			console.log('Application NOT FOUND');
		}
	})
	.catch(function(err) {
			console.error(err.message);
			console.error(err.stack);
	});

