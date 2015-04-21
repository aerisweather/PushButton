/// <reference path="../../typings/vendor.d.ts" />
import ErrorClass = require('./ErrorClass');

class ConfigError extends ErrorClass {

	constructor(configKey:string, message:string) {
		super(message);
		this.message = 'Config Error: ' + configKey + ":\n\t" + message;
	}
}

export = ConfigError;