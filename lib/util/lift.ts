/// <reference path="../../typings/vendor.d.ts" />
import when = require('when');
/**
 * Converts async functions with node-style callbacks
 * into promise-returning functions.
 *
 * When I say "node-style callbacks" I mean
 *  function(err, val) {}
 */
var lift = function<TVal>(method:Function, context:any):When.PromiseFn<TVal> {
  return (...args) => {
    return when.promise<TVal>((resolve:Function, reject:Function) => {
      method.apply(context, args.concat(
        // Add callback handler to arguments
        (err, val) => {
          if (err) {
            reject(err);
          }
          else {
            resolve(val);
          }
        }
      ));
    });
  }
};

export = lift;