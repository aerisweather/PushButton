///<reference path="../../../../../typings/vendor.d.ts" />
import ResourceConfigInterface = require('../../../config/ResourceConfigInterface');
import EbAppVersion = require('../EbAppVersion');
import EbConfigTagInterface = require('./EbConfigTagInterface');
import SqsQueue = require('../../sqs/SqsQueue');

interface EbEnvironmentConfigInterface extends ResourceConfigInterface {
    applicationName: string;
    environmentName: string;
    appVersion: EbAppVersion;
    region: string;
    waitUntilReady: boolean;
    solutionStack: {
        os: string;
        stack: string;
    };
    options?: {
        scaling?:any;
        instances?:any;
        notifications?:any;
        updates?:any;
        sqsWorker?: {
            sqsQueue:SqsQueue;
            queueUrl?:string;
        }
        loadBalancing?:any;
        phpContainer?:any;
        nodeJsContainer?:any;
    };
    rawOptions?: any;
    environmentVars?: Dictionary<string>;
    description?: string;
    cnamePrefix?: string;
    tier?: string;
    tags?: EbConfigTagInterface[];
    templateName?: string;
}
export = EbEnvironmentConfigInterface;