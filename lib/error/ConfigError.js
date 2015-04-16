var util = require('util');

/**
 * Config Error
 *
 * There was an error with the way the config was formatted.
 *
 * @param configKey - A dot notated path to the key
 * @param message
 * @constructor
 */
function ConfigError(configKey, message) {
	Error.call(this);
	this.message = 'Config Error: ' + configKey + ":\n\t" + message;
	Error.captureStackTrace(this, this.constructor);
}
util.inherits(ConfigError, Error);

module.exports = ConfigError;