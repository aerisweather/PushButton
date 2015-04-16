var when = require('when');

var EbWorker = function(config) {
  this.config = config;
};

EbWorker.prototype.run = function() {
  return when({
    message: 'You made an eb worker!',
    service: this
  });
};

module.exports = EbWorker;