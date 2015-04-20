///<reference path="../definitely-typed/when/when.d.ts" />
declare function Wire<TSpec, TContext extends Wire.Context>(spec:TSpec): When.Promise<TContext>;

declare module Wire {

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
}

declare module 'wire' {
  export = Wire;
}