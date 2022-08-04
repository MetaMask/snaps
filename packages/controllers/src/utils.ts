import { Duration, inMilliseconds } from '@metamask/utils';
import { EventObject, StateMachine, Typestate } from '@xstate/fsm';
import { Timer } from './snaps/Timer';

declare interface AssertionError extends Error {
  code: 'ERR_ASSERTION';
}
let assert: (value: any, message?: string | Error) => asserts value;
let AssertionError: new (options: { message: string }) => AssertionError;

if (typeof window === 'undefined') {
  ({ assert, AssertionError } = require('assert'));
} else {
  AssertionError = class extends Error {
    constructor(options: { message: string }) {
      super(options.message);
    }

    code = 'ERR_ASSERTION' as const;
  };
  assert = (value, message) => {
    if (!value) {
      if (message instanceof Error) {
        throw message;
      }
      throw new AssertionError({ message: message ?? 'Assertion failed' });
    }
  };
}

export { assert, AssertionError };

/**
 * Takes two objects and does a Set Difference of them.
 * Set Difference is generally defined as follows:
 * ```
 * 𝑥 ∈ A ∖ B ⟺ 𝑥 ∈ A ∧ 𝑥 ∉ B
 * ```
 * Meaning that the returned object contains all properties of A expect those that also
 * appear in B. Notice that properties that appear in B, but not in A, have no effect.
 *
 * @see [Set Difference]{@link https://proofwiki.org/wiki/Definition:Set_Difference}
 * @param objectA - The object on which the difference is being calculated.
 * @param objectB - The object whose properties will be removed from objectA.
 * @returns The objectA without properties from objectB.
 */
export function setDiff<
  ObjectA extends Record<any, unknown>,
  ObjectB extends Record<any, unknown>,
>(objectA: ObjectA, objectB: ObjectB): Diff<ObjectA, ObjectB> {
  return Object.entries(objectA).reduce<Record<any, unknown>>(
    (acc, [key, value]) => {
      if (!(key in objectB)) {
        acc[key] = value;
      }
      return acc;
    },
    {},
  ) as Diff<ObjectA, ObjectB>;
}

/**
 * A Promise that delays it's return for a given amount of milliseconds.
 *
 * @param timerOrMs - Milliseconds to delay the execution for or a {@link Timer} to be used.
 * @param result - The result to return from the Promise after delay.
 * @returns A promise that is void if no result provided, result otherwise.
 * @template Result - The `result`.
 */
export function delay<Result = void>(
  timerOrMs: Timer | number,
  result?: Result,
): Promise<Result> & { cancel: () => void } {
  const timer =
    typeof timerOrMs === 'number' ? new Timer(timerOrMs) : timerOrMs;

  let rejectFunc: (reason: Error) => void;
  const promise: any = new Promise<Result>((resolve: any, reject) => {
    timer.start(() => {
      result === undefined ? resolve() : resolve(result);
    });
    rejectFunc = reject;
  });

  promise.cancel = () => {
    if (!timer.isFinished()) {
      timer.cancel();
      rejectFunc(new Error('The delay has been canceled.'));
    }
  };
  return promise;
}

/**
 * We use a Symbol instead of rejecting the promise so that Errors thrown
 * by the main promise will propagate.
 * @see {@link withTimeout}
 */
export const hasTimedOut = Symbol(
  'Used to check if the requested promise has timeout (see withTimeout)',
);

/**
 * Executes the given Promise, if the Timer expires before the Promise settles, we return earlier.
 *
 * **NOTE:** The given Promise is not cancelled or interrupted, and will continue to execute uninterrupted. We will just discard its result if it does not complete before the timeout.
 *
 * @param promise - The promise that you want to execute.
 * @param timerOrMs - The timer controlling the timeout or a ms value.
 * @returns The resolved `PromiseValue`, or the hasTimedOut symbol if
 * returning early.
 * @template PromiseValue- - The value of the Promise.
 */
export async function withTimeout<PromiseValue = void>(
  promise: Promise<PromiseValue>,
  timerOrMs: Timer | number,
): Promise<PromiseValue | typeof hasTimedOut> {
  const timer =
    typeof timerOrMs === 'number' ? new Timer(timerOrMs) : timerOrMs;
  const delayPromise = delay(timer, hasTimedOut);
  try {
    return await Promise.race([promise, delayPromise]);
  } finally {
    delayPromise.cancel();
  }
}

/**
 * Given Value param, narrows TState union to states that intersect with the Value parameter
 * @see {@link waitForState}
 */
type _StateNarrowedByValue<
  TContext extends object,
  TEvent extends EventObject,
  TState extends Typestate<TContext>,
  Value extends TState['value'] | readonly TState['value'][],
> = StateMachine.State<
  TContext,
  TEvent,
  ExtractOnProp<TState, 'value', ToUnion<EnsureInArray<Value>>>
>;
/**
 * Waits for a specific state to be reached in a xstate state machine
 *
 * @param interpreter The state machine that will be observed
 * @param target The state value that will be waited for. Can also be an array to wait for any of the states
 * @returns A promise resolving when the given state is reached
 *
 * @example
 * ```
 * const config = {
 *  initial: 'running',
 *  states: {
 *    running: {
 *      STOP: 'stopping'
 *    },
 *    stopping: {
 *      actions: 'executeStop',
 *      STOPPED: 'stopped'
 *    },
 *    stopped: {
 *    }
 *  }
 * };
 * // ...
 * interpreter.send('STOP');
 * await waitFor(interpreter, 'stopped');
 * console.log("The machine has stopped");
 * ```
 */
export async function waitForState<
  TContext extends object,
  TEvent extends EventObject,
  TState extends Typestate<TContext>,
  Value extends TState['value'],
>(
  interpreter: StateMachine.Service<TContext, TEvent, TState>,
  target: Value | readonly Value[],
  timeoutMs: number = inMilliseconds(1, Duration.Second),
): Promise<_StateNarrowedByValue<TContext, TEvent, TState, Value>> {
  const targetArray = Array.isArray(target) ? target : [target];
  type Result = _StateNarrowedByValue<TContext, TEvent, TState, Value>;

  // xstate/fsm calls the listener during the initial subscription, which means
  // that unsubscribe call may be not yet initialized when the current state fits
  const matches = (
    state: StateMachine.State<TContext, TEvent, TState>,
  ): state is Result => targetArray.some((target) => state.matches(target));
  if (matches(interpreter.state)) {
    return interpreter.state;
  }

  let resolve: (state: Result) => void;
  const promise = new Promise<Result>((r) => {
    resolve = r;
  });
  const { unsubscribe } = interpreter.subscribe((state) => {
    if (matches(state)) {
      unsubscribe();
      resolve(state);
    }
  });
  const result = await withTimeout(promise, timeoutMs);
  if (result === hasTimedOut) {
    unsubscribe();
    throw new AssertionError({
      message: 'Waiting for state transition has timed out',
    });
  }

  return result;
}

/**
 * Wraps a type in array if already isn't an array
 */
type EnsureInArray<T> = T extends Array<any> ? T : Array<T>;

/**
 * Converts an array to a union of it's possible value types
 */
type ToUnion<T extends Array<any>> = T[number];

/**
 * Similar to {@link Extract}.
 * It extracts objects from a union based on a type of one of it's properties
 *
 * @example
 * ```typescript
 * type Test = ExtractOnProp<
 *   | { value: 'test1' | 'test2', prop1: any }
 *   | { value: 'test3', prop2: any },
 *   'value',
 *   'test1'>;
 * // Test == { value: 'test1', prop1: any }
 * ```
 */
// https://stackoverflow.com/a/73160226/4783965
type ExtractOnProp<T, Key extends keyof T, ValueType> = T extends unknown
  ? ValueType extends T[Key]
    ? { [P in keyof T]: P extends Key ? T[P] & ValueType : T[P] }
    : never
  : never;

/**
 * Ensure that the interpreter is strict.
 * Strict means that the transition must occur.
 * The event must exist in .on {} state config and it's guard must succeed.
 *
 * The error will be thrown when an invalid `interpreter.send()` is called
 * and will be bubbled there
 *
 * **TODO(ritave): Doesn't support self transitions**
 *
 * @param interpreter - The interpreter that will be force into strict mode
 * @throw {@link Error} Thrown when the transition is invalid
 */
export function forceStrict(interpreter: StateMachine.Service<any, any, any>) {
  // As soon as a listener subscribes, it is called. It might be called in
  // an initial state which doesn't have the .changed property
  let onInitialCalled = false;
  interpreter.subscribe((state) => {
    if (onInitialCalled && !state.changed) {
      throw new Error('Invalid state transition');
    }
    onInitialCalled = true;
  });
}

/* istanbul ignore next */
/**
 * Use in the default case of a switch that you want to be fully exhaustive.
 * Using this function forces the compiler to enforces exhaustivity during compile-time.
 *
 * @example
 * ```
 * const snapPrefix = snapIdToSnapPrefix(snapId);
 * switch (snapPrefix) {
 *   case SnapIdPrefixes.local:
 *     ...
 *   case SnapIdPrefixes.npm:
 *     ...
 *   default:
 *     assertExhaustive(snapPrefix);
 * }
 * ```
 * @param _object - The object on which the switch is being operated.
 */
export function assertExhaustive(_object: never): never {
  throw new AssertionError({
    message: 'Invalid branch reached. Should be detected during compilation',
  });
}

/**
 * Checks whether the type is composed of literal types
 *
 * @returns @type {true} if whole type is composed of literals, @type {false} if whole type is not literals, @type {boolean} if mixed
 * @example
 * ```
 * type t1 = IsLiteral<1 | 2 | "asd" | true>;
 * // t1 = true
 *
 * type t2 = IsLiteral<number | string>;
 * // t2 = false
 *
 * type t3 = IsLiteral<1 | string>;
 * // t3 = boolean
 *
 * const s = Symbol();
 * type t4 = IsLiteral<typeof s>;
 * // t4 = true
 *
 * type t5 = IsLiteral<symbol>
 * // t5 = false;
 * ```
 */
type IsLiteral<T> = T extends string | number | boolean | symbol
  ? Extract<string | number | boolean | symbol, T> extends never
    ? true
    : false
  : false;

/**
 * Returns all keys of an object, that are literal, as an union
 *
 * @example
 * ```
 * type t1 = _LiteralKeys<{a: number, b: 0, c: 'foo', d: string}>
 * // t1 = 'b' | 'c'
 * ```
 * @see [Literal types]{@link https://www.typescriptlang.org/docs/handbook/literal-types.html}
 */
type _LiteralKeys<T> = NonNullable<
  {
    [Key in keyof T]: IsLiteral<Key> extends true ? Key : never;
  }[keyof T]
>;

/**
 * Returns all keys of an object, that are not literal, as an union
 *
 * @example
 * ```
 * type t1 = _NonLiteralKeys<{a: number, b: 0, c: 'foo', d: string}>
 * // t1 = 'a' | 'd'
 * ```
 * @see [Literal types]{@link https://www.typescriptlang.org/docs/handbook/literal-types.html}
 */
type _NonLiteralKeys<T> = NonNullable<
  {
    [Key in keyof T]: IsLiteral<Key> extends false ? Key : never;
  }[keyof T]
>;

/**
 * A set difference of two objects based on their keys
 *
 * @example
 * ```
 * type t1 = Diff<{a: string, b: string}, {a: number}>
 * // t1 = {b: string};
 * type t2 = Diff<{a: string, 0: string}, Record<string, unknown>>;
 * // t2 = { a?: string, 0: string};
 * type t3 = Diff<{a: string, 0: string, 1: string}, Record<1 | string, unknown>>;
 * // t3 = {a?: string, 0: string}
 * ```
 * @see {@link setDiff} for the main use-case
 */
export type Diff<A, B> = Omit<A, _LiteralKeys<B>> &
  Partial<Pick<A, Extract<keyof A, _NonLiteralKeys<B>>>>;

/**
 * Makes every specified property of the specified object type mutable.
 *
 * @template T - The object whose readonly properties to make mutable.
 * @template TargetKey - The property key(s) to make mutable.
 */
export type Mutable<
  T extends Record<string, unknown>,
  TargetKey extends string,
> = {
  -readonly [Key in keyof Pick<T, TargetKey>]: T[Key];
} &
  {
    [Key in keyof Omit<T, TargetKey>]: T[Key];
  };
