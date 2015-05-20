///<reference path="../definitely-typed/when/when.d.ts" />
declare module When {
  interface PromiseFn<TVal> {
    (...any):When.Promise<TVal>;
  }

  /**
   * var sequence = require('when/sequence');
   *
   * var resultsPromise = sequence(arrayOfTasks, arg1, arg2,...)
   *
   * Run an array of tasks in sequence, without overlap.
   * Each task will be called with the arguments passed to when.sequence(),
   * and each may return a promise or a value.
   *
   * When all tasks have completed, the returned promise
   * will resolve to an array containing the result of each
   * task at the corresponding array position. The returned
   * promise will reject when any task throws or returns a rejection.
   */
  function Sequence<TItemVal>(tasks:PromiseFn<TItemVal>[], ...args):When.Promise<TItemVal[]>;

  function Poll<TResult>(task:PromiseFn<TResult>, interval:number, condition:PromiseFn<TResult>, initialDelay?:number);
}

import WhenSequence = When.Sequence;
import WhenPoll = When.Poll;

declare module 'when/sequence' {
  export = WhenSequence;
}

declare module 'when/poll' {
  export = WhenPoll;
}