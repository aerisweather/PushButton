declare module AWS {
    class ElasticBeanstalk {
        constructor(...params:any[]);
        public createApplication(...params:any[]):any;
        public createApplicationVersion(...params:any[]):any;
        public describeApplications(options:any, callback:{(err:string, data:any[])}):void;
    }
}

declare module 'aws-sdk' {
    export = AWS;
}