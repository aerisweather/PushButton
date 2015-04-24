///<reference path="../../typings/vendor.d.ts" />
import events = require('events');
import readline = require('readline');

class ReadLineMock extends events.EventEmitter implements readline.ReadLine {
  protected openQuestion:{
    query: string;
    callback: (answer:any) => void;
  };

  public question(query:string, callback:(answer:any) => void):void {
    this.openQuestion = {
      query: query,
      callback: callback
    };
  }

  /** Answer the last asked question */
  public answer(answer:any) {
    if (!this.openQuestion) {
      throw new Error('Unable to answer: no question was asked');
    }
    this.openQuestion.callback(answer);

    this.openQuestion = null;
  }

  public wasAskedQuestion(query:string) {
    return this.openQuestion && this.openQuestion.query === query;
  }

  public setPrompt(prompt:string, length:number):void {
    throw new Error('method not yet implemented by ReadLineMock');
  }

  public prompt(preserveCursor?:boolean):void {
    throw new Error('method not yet implemented by ReadLineMock');
  }

  public pause():void {
    throw new Error('method not yet implemented by ReadLineMock');
  }

  public resume():void {
    throw new Error('method not yet implemented by ReadLineMock');
  }

  public close():void {
    throw new Error('method not yet implemented by ReadLineMock');
  }

  public write(data:any, key?:any):void {
    throw new Error('method not yet implemented by ReadLineMock');
  }
}
export = ReadLineMock;