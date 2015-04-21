import ResultInterface = require('../../result/ResultInterface');

class EbAppVersionResult implements ResultInterface {
    message = 'Created ElasticBeanstalk AppVersion';
    versionLabel:string;

    constructor(versionLabel:string) {
        this.versionLabel = versionLabel;
    }
}
export = EbAppVersionResult;