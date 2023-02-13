import EventEmitter from 'eventemitter3';

import Logger from '../Logger/Logger';

import type { EventsDescription, EventUnsubscribe } from './Emitter.types';


export default abstract class Emitter<Events extends EventsDescription> {


  // ----
  // Private instance fields
  // ----
  private readonly _internalEmitter = new EventEmitter();

  private readonly _emitterLogger: Logger;

  private _enabled: boolean = true;


  // ----
  // Class Constructor
  // ----
  protected constructor(private readonly _module: string) {
    /** Instantiate the Logger */
    this._emitterLogger = Logger.forContext(`${_module}Emitter`);
  }


  // ----
  // Private Methods
  // ----
  private _getEventName(event: keyof Events): string {
    return `${this._module}::${String(event)}`;
  }


  // ----
  // Protected Methods
  // ----

  /**
   * Enable the EventEmitter
   *
   * @protected
   */
  protected enableEventEmitter() {
    this._enabled = true;
  }


  /**
   * Disable the EventEmitter
   *
   * @protected
   */
  protected disableEventEmitter() {
    this._enabled = false;
  }


  // ----
  // Public Methods
  // ----

  /**
   * Subscribe to an event
   *
   * @param event
   * @param callback
   * @param context
   * @protected
   */
  public subscribe<Name extends keyof Events>(
    event: Name,
    callback: Events[Name],
    context?: any
  ): EventUnsubscribe {
    /** Create callback function with binding */
    const wrappedCallback = (args: Parameters<Events[Name]>) => {
      /** Call the callback */
      callback.apply(context, args);
    };

    /** Log the Subscriber and register the callback */
    this._emitterLogger.info(
      `New Observer registered for module ${this._module} on ${String(event)} event`,
      { callback, context }
    );
    this._internalEmitter.on(this._getEventName(event), wrappedCallback);

    /** Return a function that could be used to remove the listener */
    return () => {
      /** Remove the listener from emitter */
      this._emitterLogger.info(
        `Removing Observer for module ${this._module} on ${String(event)} event`,
        { callback, context }
      );
      this._internalEmitter.off(this._getEventName(event), wrappedCallback);
    };
  }


  /**
   * Dispatch event with arguments to all subscribers
   *
   * @param event
   * @param args
   * @protected
   */
  protected dispatch<Name extends keyof Events>(event: Name, args: Parameters<Events[Name]>) {
    if (!this._enabled) {
      this._emitterLogger.warn(`Dispatching for module ${this._module} is disabled`, { event, args });
      return;
    }

    this._emitterLogger.info(`Dispatching event for module ${this._module}`, { event, args });
    this._internalEmitter.emit(this._getEventName(event), args);
  }


}
