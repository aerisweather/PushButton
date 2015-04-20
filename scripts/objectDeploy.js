var S3Object = require('../lib/resource/aws/s3/S3Object');
var FileProvider = require('../lib/resource/system/file/FileProvider');
var GitFileProvider = require('../lib/resource/system/file/GitArchiveProvider');
var Bucket = require('../lib/resource/aws/s3/Bucket');

var fileProvider = new GitFileProvider({
});
var bucket = new Bucket({
  name: 'turbine-eb'
});
var s3Obj = new S3Object({
  fileProvider: fileProvider,
  bucket: bucket,
  key: 'GitArchive.zip'
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