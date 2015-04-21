var pushButtonConfig = require('./PushButton');
var ResourceCollection = require('../lib/resource/ResourceCollection');

var rc = new ResourceCollection(pushButtonConfig);

var UNIQUE = Math.round(Math.random() * 1000);
pushButtonConfig.params.version = 'v' + UNIQUE;

rc.deploy().
  done(quit, fail);

rc.on('deploy', function(result, resource) {
  console.log(result.message);
});

rc.on('error', function(error, resource) {
  console.error(error);
});


function logResult(res) {
  console.log(res.message);
}

function quit() {
  var args = [].slice.call(arguments, 0);
  console.log('You did it!');
  process.exit(0);
}

function fail(err) {
  console.error(err);
  process.exit(1);
}