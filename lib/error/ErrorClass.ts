/// <reference path="../../typings/vendor.d.ts" />

declare class ErrorClass implements Error {
    public name: string;
    public message: string;
    public stack: any;
    constructor(message?: string);
}

export = ErrorClass;