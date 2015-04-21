///<reference path="../../../typings/vendor.d.ts" />
var handlebars = require('handlebars');

var plugin:Wire.PluginFactory = function(options) {
  return {
    resolvers: {
      json: function(resolver, refStr, refObj:{ json:any }, wire) {
        var jsonObj = refObj.json;

        try {
          resolver.resolve(JSON.stringify(jsonObj));
        }
        catch (err) {
          resolver.reject(err);
        }
      }
    }
  }
};

export = plugin;
