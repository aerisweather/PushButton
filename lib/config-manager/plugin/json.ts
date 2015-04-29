///<reference path="../../../typings/vendor.d.ts" />
var handlebars = require('handlebars');

var plugin:Wire.PluginFactory = function(options) {
  return {
    resolvers: {
      json: function(resolver, refStr, refObj:{ json:any }, wire) {

        wire(refObj.json).
          then((json:any) => resolver.resolve(JSON.stringify(json))).
          catch((err:Error) => resolver.reject(err));
      }
    }
  }
};

export = plugin;
