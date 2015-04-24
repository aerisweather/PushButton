///<reference path="../../typings/vendor.d.ts" />
import when = require('when');
import Cli = require('../../lib/util/Cli');
import _ = require('lodash');

class CliMock extends Cli {

  public flaggedArgs = {};
  protected answers = {};
  protected askedQuestions:string[] = [];

  public getFlaggedArg<TValue>(...flags:string[]):TValue {
    return flags.reduce((val:any, flag:string) => {
      return val || this.flaggedArgs[flag] || null;
    }, null);
  }

  public setFlaggedArg(flag:string, argValue:any) {
    this.flaggedArgs[flag] = argValue;
  }

  public ask(question:string, defaultValue:any = null):When.Promise<any> {
    var answer = this.answers[question] || this.answers['CLI_MOCK_ANY'];

    this.askedQuestions.push(question);

    if (answer === undefined) {
      new Error('No answers have been stubbed for question "' + question + '"');
    }

    return when(answer);
  }

  /** Prepare an answer for a specific question */
  public prepareAnswer(question: string, answer:any) {
    this.answers[question] = answer;
  }

  /** This answer will be used for any asked question */
  public prepareAnswerAny(answer:any) {
    this.answers['CLI_MOCK_ANY'] = answer;
  }

  public wasAskedQuestion(question:string) {
    return _.contains(this.askedQuestions, question);
  }
}
export = CliMock;