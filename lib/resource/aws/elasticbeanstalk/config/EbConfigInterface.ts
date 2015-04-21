import EbOptionInterface = require('./EbOptionInterface');
import EbConfigTagInterface = require('./EbConfigTagInterface');
import EbConfigSolutionStackInterface = require('./EbConfigSolutionStackInterface');
//import EbAppVersionConfigInterface = require('./EbAppVersionConfigInterface');

interface EbConfigInterface {
    applicationName:string
    environmentName:string
    description:string
    cnamePrefix:string
    tier:string
    tags?:EbConfigTagInterface[]
    solutionStack:EbConfigSolutionStackInterface
    //appVersion:EbAppVersionConfigInterface;
    options: {
        scaling?:any
        instances?:any
        notifications?:any
        updates?:any
        sqsWorker?:any
        loadBalancing?:any
        phpContainer?:any
        nodeJsContainer?:any
    }
    rawOptions?:EbOptionInterface[]
    environmentVars?:any
}
export = EbConfigInterface;