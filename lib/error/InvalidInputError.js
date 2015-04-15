var util = require('util');

/**
 * Invalid Input Error
 *
 * When there has been an issue with the input provided
 * @param variableName
 * @param message
 * @constructor
 */
function InvalidInputError(variableName, message) {
	Error.call(this);
	this.message = 'Invalid input for: ' + variableName + "\n\t" + message;
	Error.captureStackTrace(this, this.constructor);
}
util.inherits(InvalidInputError, Error);

module.exports = InvalidInputError;