/// <reference path="../../typings/vendor.d.ts" />

var BaseError = <any>Error;
class ErrorClass implements Error {
    public name: string;
    public message: string;
    public stack: any;
    constructor(message?: string) {
        BaseError.call(this);
        BaseError.captureStackTrace(this, ErrorClass);
    }
    toString() {
        return this.name + ': ' + this.message;
    }
}
ErrorClass.prototype = Object.create(BaseError.prototype);

export = ErrorClass;