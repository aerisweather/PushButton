var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../../typings/vendor.d.ts" />
var ErrorClass = require('./ErrorClass');
var InvalidInputError = (function (_super) {
    __extends(InvalidInputError, _super);
    /**
     * Invalid Input
     *
     * For a user input that was invalid.
     */
    function InvalidInputError(variableName, message) {
        _super.call(this, message);
        this.message = 'Invalid input for: ' + variableName + "\n\t" + message;
    }
    return InvalidInputError;
})(ErrorClass);
module.exports = InvalidInputError;
//# sourceMappingURL=InvalidInputError.js.map