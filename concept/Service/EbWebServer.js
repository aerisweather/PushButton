var when = require('when');

var EbWebServer = function(config) {
  this.config = config;
};

EbWebServer.prototype.run = function() {
  return when({
    message: 'You made an eb web server!',
    service: this
  });
};

module.exports = EbWebServer;