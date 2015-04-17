var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="../../typings/vendor.d.ts" />
var ErrorClass = require('./ErrorClass');
var ConfigError = (function (_super) {
    __extends(ConfigError, _super);
    function ConfigError(configKey, message) {
        _super.call(this, message);
        this.message = 'Config Error: ' + configKey + ":\n\t" + message;
    }
    return ConfigError;
})(ErrorClass);
module.exports = ConfigError;
//# sourceMappingURL=ConfigError.js.map