/// <reference path="../../typings/vendor.d.ts" />

class ErrorClass implements Error {
    public name: string;
    public message: string;
    public stack: any;
    constructor(message?: string) {
        var Error = <any>window['Error'];
        Error.call(message);
        Error.captureStackTrace(this, ErrorClass);
    }
    toString() {
        return this.name + ': ' + this.message;
    }
}

export = ErrorClass;