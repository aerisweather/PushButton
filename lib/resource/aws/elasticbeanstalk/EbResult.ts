import ResultInterface = require('../../result/ResultInterface');

class EbResult implements ResultInterface {
    message:string;
    data:Object;

    constructor(message='Created elastic beanstalk instance', data={}) {
        this.message = message;
        this.data = data;
    }
}
export = EbResult