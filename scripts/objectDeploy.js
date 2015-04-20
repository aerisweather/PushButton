var S3Object = require('../lib/resource/aws/s3/S3Object');
var FileProvider = require('../lib/resource/system/file/FileProvider');
var Bucket = require('../lib/resource/aws/s3/Bucket');

var fileProvider = new FileProvider({
  path: '/Users/edanschwartz/workspace/PushButton/README.md'
});
var bucket = new Bucket({
  name: 'turbine-eb'
});
var s3Obj = new S3Object({
  fileProvider: fileProvider,
  bucket: bucket,
  key: 'MyAwesomeFile'
});

s3Obj.deploy().
  then(function(res) {
    console.log(res.message);
  }).
  catch(function(err) {
    console.error(err);
  });




function deploy() {

}