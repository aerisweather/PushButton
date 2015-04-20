declare module AWS {
  class ElasticBeanstalk {
    constructor(...params:any[]);
    createApplication(...params:any[]):any;
    describeApplications(options:any, callback:{(err:string, data:any[])}):void;
  }
}

declare module 'aws-sdk' {
  export = AWS;
}