///<reference path="../../typings/vendor.d.ts" />
import Events = require('events');

class Logger {

  public static TRACE = 'TRACE';
  public static INFO = 'INFO';
  public static WARNING = 'WARNING';
  public static ERROR = 'ERROR';

  protected static emitter = new Events.EventEmitter();

  public static trace(message) {
    Logger.log(message, Logger.TRACE);
  }

  public static info(message) {
    Logger.log(message, Logger.INFO);
  }

  public static warning(message) {
    Logger.log(message, Logger.WARNING);
  }

  public static error(message) {
    Logger.log(message, Logger.ERROR);
  }

  public static log(message:string, level:string = Logger.INFO) {
    Logger.emitter.emit(level, message);
  }

  public static handleLog(cb:() => void, level:string = Logger.INFO) {
    Logger.emitter.on(level, cb);
  }

  public static pp(obj:any) {
    return JSON.stringify(obj, null, 2);
  }

}
export = Logger;