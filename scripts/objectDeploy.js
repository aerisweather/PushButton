var S3Object = require('../lib/resource/aws/s3/S3Object');
var GitArchiveProvider = require('../lib/resource/system/file/GitArchiveProvider');
var S3Bucket = require('../lib/resource/aws/s3/S3Bucket');

var fileProvider = new GitArchiveProvider({
});
var bucket = new S3Bucket({
  name: 'turbine-eb'
});
var s3Obj = new S3Object({
  fileProvider: fileProvider,
  bucket: bucket,
  key: 'GitArchiveTues.zip'
});

s3Obj.deploy().
  then(function(res) {
    console.log(res.message);
    process.exit(0);
  }).
  catch(function(err) {
    console.error(err);
    process.exit(1);
  });