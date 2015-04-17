/// <reference path="../../typings/vendor.d.ts" />
import ErrorClass = require('./ErrorClass');

class InvalidInputError extends ErrorClass {

	/**
	 * Invalid Input
	 *
	 * For a user input that was invalid.
	 */
	constructor(variableName:string, message:string) {
		super(message);
		this.message = 'Invalid input for: ' + variableName + "\n\t" + message;
	}
}

export = InvalidInputError;