///<reference path="../../../../../typings/vendor.d.ts" />
import ResourceConfigInterface = require('../../../config/ResourceConfigInterface');
import EbAppVersion = require('../EbAppVersion');

interface EbEnvironmentConfigInterface extends ResourceConfigInterface {
    applicationName: string;
    environmentName: string;
    appVersion: EbAppVersion;
    region: string;
    solutionStack: {
        os: string;
        stack: string;
    };
    options?: {
        scaling?:any;
        instances?:any;
        notifications?:any;
        updates?:any;
        sqsWorker?:any;
        loadBalancing?:any;
        phpContainer?:any;
        nodeJsContainer?:any;
    };
    rawOptions?: any;
    environmentVars?: Dictionary<string>;
    description?: string;
    cnamePrefix?: string;
    tier?: string;
    tags?: any;
    templateName?: string;
}
export = EbEnvironmentConfigInterface;