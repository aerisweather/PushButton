///<reference path="../definitely-typed/when/when.d.ts" />
declare
function Wire<TSpec, TContext extends Wire.Context>(spec:TSpec):When.Promise<TContext>;

declare module Wire {

  interface Dictionary<T> {
    [index:string]:T;
  }

  interface Context {
    wire<TSpec, TContext>(spec:TSpec): When.Promise<TContext>;
  }

  module Factories {
    interface create {
      create: {
        module: any;  // string or constructor
        args?: any[];
        isConstructor?: boolean;
      }
    }
  }

  interface PluginFactory {
    (options:any):Plugin;
  }

  interface Plugin {
    resolvers: Dictionary<Plugin.ReferenceResolver>;
  }

  module Plugin {
    interface ReferenceResolver {
      (resolver:Api.Resolver, refName:string, refObj:any, wire):void;
    }

    module Api {
      class Resolver {
        resolve:(any)=>void;
        reject:(error:Error)=>void;
      }
    }
  }
}

declare module 'wire' {
  export = Wire;
}