var sequence = require('when/sequence');
var handlebars = require('handlebars');

module.exports = function(options) {
  return {
    resolvers: {
      tmpl: function(resolver, templateString, refObj, wire) {
        var template = handlebars.compile(templateString);

        // get the entire wire context
        wire({}).
          // render the template with the context
          then(template).
          // resolve with the rendered template
          then(resolver.resolve).
          catch(resolver.reject);
      }
    }
  }
};
