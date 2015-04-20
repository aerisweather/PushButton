/// <reference path="../../../typings/vendor.d.ts" />

import ResourceInterface = require('../ResourceInterface');
import FileResultInterface = require('./FileResultInterface');
import fs = require('fs');
import path = require('path');
import when = require('when');
import whenNodeLift = require('when/node');

var fsOpen = whenNodeLift.lift(fs.open);

/**
 * A configurable file resource, returns a file stream.
 */
class File implements ResourceInterface {

    config:any;

    constructor(resourceConfig) {
        this.config = resourceConfig;
    }

    public deploy():when.Promise<FileResultInterface> {
        return fsOpen(this.config.path, 'r')
            .then(function (fileDescriptor:string) {
                var readStream = fs.createReadStream(null, {
                    flags: 'r',
                    fd: fileDescriptor
                });
                return {
                    stream: readStream
                }
            });
    }
}

export = File;