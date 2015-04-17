///<reference path="../../../typings/vendor.d.ts" />
var handlebars = require('handlebars');

var plugin = function(options) {
  return {
    resolvers: {
      tmpl: function(resolver, templateString, refObj, wire) {
        var template = handlebars.compile(templateString);

        // get the entire wire context
        wire.createChild({}).
          // render the template with the context
          then(template).
          // resolve with the rendered template
          then(resolver.resolve).
          catch(resolver.reject);
      }
    }
  }
};

export = plugin;
