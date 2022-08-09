import { Duration, inMilliseconds } from '@metamask/utils';
import { EventObject, StateMachine, Typestate } from '@xstate/fsm';
import { assert, hasTimedOut, withTimeout } from './utils';

const ASSIGN_ACTION: StateMachine.AssignAction = 'xstate.assign';

/**
 * Given Value param, narrows TState union to states that intersect with the Value parameter
 * @see {@link waitForStateEnter}
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
 * @throws {@link Error}. If the timeout is exceeded.
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
export async function waitForStateEnter<
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

  const matches = (
    state: StateMachine.State<TContext, TEvent, TState>,
  ): state is Result => targetArray.some((target) => state.matches(target));

  // xstate/fsm calls the listener during the initial subscription, which means
  // that unsubscribe call may be not yet initialized when the current state fits
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
    throw new Error('Waiting for state transition has timed out');
  }
  return result;
}
/**
 *
 * @param interpreter
 * @param target
 * @param timeoutMs
 * @returns
 * @throws {@link Error}. If timeout is exceeded
 */

export async function waitForStateExit<
  TContext extends object,
  TEvent extends EventObject,
  TState extends Typestate<TContext>,
>(
  interpreter: StateMachine.Service<TContext, TEvent, TState>,
  target: TState['value'] | readonly TState['value'][],
  timeoutMs: number = inMilliseconds(1, Duration.Second),
): Promise<StateMachine.State<TContext, TEvent, TState>> {
  type Result = StateMachine.State<TContext, TEvent, TState>;
  const targetArray = Array.isArray(target) ? target : [target];

  const matches = (state: Result) =>
    targetArray.some((target) => state.matches(target));

  let last = interpreter.state;

  let resolve: (state: Result) => void;
  const promise = new Promise<Result>((r) => (resolve = r));

  const { unsubscribe } = interpreter.subscribe((state) => {
    if (matches(last) && state.value !== last.value) {
      unsubscribe();
      resolve(state);
    }
    last = state;
  });

  const result = await withTimeout(promise, timeoutMs);
  if (result === hasTimedOut) {
    unsubscribe();
    throw new Error('Waiting for state transition has timed out');
  }
  return result;
}
/**
 * Validates the set-up of a @xstate/fsm machine.
 *
 * 1. Checks that the initial state exists
 * 2. Ensures that all named actions in the config have a provided implementation
 *
 * @param machine The machine to validate
 * @throws {@link AssertionError}. If the validation fails
 */

export function validateMachine<
  TContext extends object,
  TEvent extends EventObject,
  TState extends Typestate<TContext>,
>(machine: StateMachine.Machine<TContext, TEvent, TState>) {
  assert('_options' in machine, 'The machine is not an @xstate/fsm machine');
  const typed = machine as StateMachine.Machine<TContext, TEvent, TState> & {
    _options: { actions?: StateMachine.ActionMap<TContext, TEvent> };
  };

  // 1.
  assert(
    typed.config.initial in typed.config.states,
    `Initial state "${typed.config.initial}" not found in state definitions`,
  );

  // 2.
  const toArray = <T>(obj: T | T[]): T[] =>
    Array.isArray(obj) ? obj : obj === undefined || obj === null ? [] : [obj];
  const actions = new Set<string>();
  const addActions = (actions: any) =>
    toArray(actions)
      .flatMap((action) =>
        typeof action === 'string'
          ? [action]
          : action.exec === undefined && action.type !== ASSIGN_ACTION
          ? [action.type]
          : [],
      )
      .forEach(actions.add.bind(actions));
  for (const state of Object.values<typeof typed.config.states[string]>(
    typed.config.states,
  )) {
    addActions(state.entry);
    addActions(state.exit);
    for (const transition of Object.values<any>(state.on ?? {})) {
      addActions(transition.actions);
    }
  }
  actions.forEach((action) =>
    assert(
      typed._options.actions !== undefined && action in typed._options.actions,
      `Action "${action}" doesn't have an implementation`,
    ),
  );
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
    ? {
        [P in keyof T]: P extends Key ? T[P] & ValueType : T[P];
      }
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
