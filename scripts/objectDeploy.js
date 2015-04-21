var S3Object = require('../lib/resource/aws/s3/S3Object');
var GitArchiveProvider = require('../lib/resource/system/file/GitArchiveProvider');
var S3Bucket = require('../lib/resource/aws/s3/S3Bucket');
var SqsQueue = require('../lib/resource/aws/sqs/SqsQueue');
var AppVersion = require('../lib/resource/aws/elasticbeanstalk/EbAppVersion');
var EbEnvironment = require('../lib/resource/aws/elasticbeanstalk/EbEnvironment');

var UNIQUE = Math.round(Math.random() * 1000);
var fileProvider = new GitArchiveProvider({});
var bucket = new S3Bucket({
  bucketName: 'turbine-eb'
});
var s3Obj = new S3Object({
  fileProvider: fileProvider,
  bucket: bucket,
  key: 'GitArchiveTues.zip'
});
var appVersion = new AppVersion({
  region: 'us-east-1',
  ApplicationName: 'PushButton Sandbox',
  VersionLabel: 'Testing PushButton ' + UNIQUE,
  Description: 'Testing at ' + new Date().toLocaleString(),
  s3Object: s3Obj
});

var sqsQueue = new SqsQueue({
  region: 'us-east-1',
  queueName: 'push-button-' + UNIQUE,
  attributes: {
    Policy: JSON.stringify({
      Statement: [
        {
          Effect: "Allow",
          Action: "SQS:*",
          Principal: {
            AWS: "arn:aws:iam::350421549183:user/turbine-sqs"
          }
        }
      ]
    })
  }
});

var ebEnvironment = new EbEnvironment({
  applicationName: 'PushButton Sandbox',
  environmentName: 'push-button-' + UNIQUE,
  appVersion: appVersion,
  region: 'us-east-1',
  solutionStack: {
    os: '64bit Amazon Linux',
    stack: 'PHP 5.5'
  },
  tier: 'WebServer',
  cnamePrefix: 'push-button-' + UNIQUE,
  environmentVars: {
    FOO: 'BAR'
  }/*,
   options: {
   sqsWorker: {
   sqsQueue: sqsQueue,
   httpPostPath: '/alert-engine'
   }
   }*/
});

s3Obj.deploy().
  tap(logResult).
  then(function(res) {
    return appVersion.deploy();
  }).
  tap(logResult).
  then(function(res) {
    return sqsQueue.deploy();
  }).
  tap(logResult).
  then(function(res) {
    return ebEnvironment.deploy();
  }).
  tap(logResult).
  done(quit, fail);

function logResult(res) {
  console.log(res.message);
}

function quit() {
  process.exit(0);
}

function fail(err) {
  console.error(err);
  process.exit(1);
}