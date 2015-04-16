/**
 * Converts async functions with node-style callbacks
 * into promise-returning functions.
 *
 * When I say "node-style callbacks" I mean
 *  function(err, val) {}
 *
 * @param method
 * @param context
 * @returns {Function}
 */
module.exports = function lift(method, context) {
  return function lifted(params) {
    // convert arguments to array
    var args = [].slice.call(arguments, 0);

    // Wrap method in a promise
    return new Promise(function(resolve, reject) {
      // Add a callback to the method arguments,
      // which takes care of resolving/rejecting the promise
      args.push(function methodCallback(err, val) {
        if (err) {
          reject(err);
        }
        else {
          resolve(val);
        }
      });

      // Call the method.
      method.apply(context, args);
    });
  }
};