var AWS = require('aws-sdk');
var when = require('when');
var _ = require('lodash');
var fs = require('fs');
var s3 = new AWS.S3();
var eb = new AWS.ElasticBeanstalk({
  region: 'us-east-1'
});
var lift = require('../lib/util/lift');

var SESSION_ID = _.uniqueId('JUST-PLAYIN-' + new Date().getTime() + '-');
var ARCHIVE_PATH = process.cwd() + './archive.zip';
var S3_BUCKET = 'turbine-eb';
var APP_VERSION_KEY = 'turbine-' + SESSION_ID;
var ENV_NAME = 'turbine-test-env-' + new Date().getTime();


var putObject = lift(s3.putObject, s3);
var createAppVersion = lift(eb.createApplicationVersion, eb);
var createEnv = lift(eb.createEnvironment, eb);


when(putObject({
  Bucket: S3_BUCKET,
  Key: APP_VERSION_KEY,
  Body: fs.readFileSync(ARCHIVE_PATH)
})).
  tap(Logger('I pushed your archive to s3.')).
  then(function() {
    return createAppVersion({
      ApplicationName: 'Turbine API',
      VersionLabel: APP_VERSION_KEY,
      Description: 'Made this will playing with CI scripts. You can delete it if you want.',
      SourceBundle: {
        S3Bucket: S3_BUCKET,
        S3Key: APP_VERSION_KEY
      }
    });
  }).
  tap(Logger('I created an application version called ' + APP_VERSION_KEY)).
  then(function() {
    return createEnv({
      ApplicationName: 'Turbine API',
      EnvironmentName: ENV_NAME,
      CNAMEPrefix: APP_VERSION_KEY,
      Description: 'Playing with CI tools. You can delete me.',
      TemplateName: 'turbine-api-staging',
      VersionLabel: APP_VERSION_KEY
    });
  }).
  tap(Logger('A made an environment called ' + ENV_NAME)).
  catch(ErrorLogger('Something went wrong')).
  then(function() {
    process.exit(0);
  });

function Logger(msg) {
  return function(obj) {
    console.log(msg);
  }
}

function ErrorLogger(msg) {
  return function(err) {
    console.error(msg);
    console.error(err);
  }
}