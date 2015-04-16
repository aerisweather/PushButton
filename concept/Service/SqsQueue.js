var when = require('when');

var SqsQueue = function(config) {
  this.config = config;
};

SqsQueue.prototype.run = function() {
  return when({
    message: 'You made an sqs queue!',
    service: this
  }).
    tap(function() {
      // to simulate that we only
      // know our URL after the queue has be created by AWS
      this.url = 'resolved/url'
    }.bind(this));
};

module.exports = SqsQueue;