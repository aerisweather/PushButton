///<reference path="../typings/vendor.d.ts" />

import AdmiralCli = require('admiral-cli');
import Debug = require('debug');
import fs = require('fs-extra');
import glob = require('glob');
import InvalidInputError = require('../lib/error/InvalidInputError');
import path = require('path');

var debug = Debug('main');

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

function getConfig (configDir:string, applicationName:string, environment:string) {
	var configPath = path.resolve(configDir);

	if (fs.lstatSync(configPath).isDirectory()) {
		//Search directory for json files
		var paths = glob.sync(path.join(configPath, '*.json'));
		//Parse configs
		var configs:any[] = paths.map(function (configPath) {
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