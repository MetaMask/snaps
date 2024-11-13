import { EventEmitter } from 'events';

/**
 * A string or symbol that represents an event name.
 */
type EventKey = string | symbol;

/**
 * A map of event names to listener functions.
 */
export type EventMap = Record<EventKey, (...args: any[]) => void>;

/**
 * An {@link EventEmitter} that is typed to a specific set of events.
 *
 * @param event
 * @param listener
 * @template Events - The event map type, i.e., a record of event names to
 * listener functions, which is used for typing the events that can be emitted
 * and listened to.
 * @example
 * type MyEvents = {
 *  foo: (a: number, b: string) => void;
 *  bar: (c: boolean) => void;
 * };
 *
 * const emitter: TypedEventEmitter<MyEvents> = new EventEmitter();
 * emitter.on('foo', (a, b) => console.log(a, b)); // Has correct types.
 */
export abstract class TypedEventEmitter<
  Events extends EventMap,
> extends EventEmitter {
  emit<Event extends keyof Events>(
    event: Event extends EventKey ? Event : never,
    ...args: Parameters<Events[Event]>
  ): boolean {
    return super.emit(event, ...args);
  }

  off<Event extends keyof Events>(
    event: Event extends EventKey ? Event : never,
    listener: Events[Event],
  ): this {
    return super.off(event, listener);
  }

  on<Event extends keyof Events>(
    event: Event extends EventKey ? Event : never,
    listener: Events[Event],
  ): this {
    return super.on(event, listener);
  }

  once<Event extends keyof Events>(
    event: Event extends EventKey ? Event : never,
    listener: Events[Event],
  ): this {
    return super.once(event, listener);
  }
}
