import { assert } from '@metamask/utils';
import type { EventObject, StateMachine, Typestate } from '@xstate/fsm';
import { InterpreterStatus } from '@xstate/fsm';

/**
 * Validates the set-up of a @xstate/fsm machine.
 *
 * 1. Ensures that all named actions in the config have a provided implementation.
 *
 * @param machine - The machine to validate.
 * @throws {@link AssertionError}. If the validation fails.
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
  const toArray = <Type>(obj: Type | Type[]): Type[] => {
    if (Array.isArray(obj)) {
      return obj;
    } else if (obj === undefined || obj === null) {
      return [];
    }
    return [obj];
  };

  const allActions = new Set<string>();
  const addActions = (actions: any) =>
    toArray(actions)
      .flatMap((action) => {
        if (typeof action === 'string') {
          return [action];
        }
        assert(typeof action === 'function');
        return [];
      })
      .forEach(allActions.add.bind(allActions));

  for (const state of Object.values<typeof typed.config.states[string]>(
    typed.config.states,
  )) {
    addActions(state.entry);
    addActions(state.exit);
    for (const transition of Object.values<any>(state.on ?? {})) {
      addActions(transition.actions);
    }
  }

  allActions.forEach((action) =>
    assert(
      typed._options.actions !== undefined && action in typed._options.actions,
      `Action "${action}" doesn't have an implementation`,
    ),
  );
}

/**
 * Ensure that the interpreter is strict.
 * Strict means that the transition must occur.
 * The event must exist in .on {} state config and it's guard must succeed.
 *
 * The error will be thrown when an invalid `interpreter.send()` is called
 * and will be bubbled there.
 *
 * TODO(ritave): Doesn't support self transitions.
 *
 * @param interpreter - The interpreter that will be force into strict mode.
 * @throws {@link Error} Thrown when the transition is invalid.
 */
export function forceStrict(interpreter: StateMachine.Service<any, any, any>) {
  // As soon as a listener subscribes, it is called. It might be called in
  // an initial state which doesn't have the .changed property
  let onInitialCalled = false;
  interpreter.subscribe((state) => {
    assert(!onInitialCalled || state.changed, 'Invalid state transition');
    onInitialCalled = true;
  });

  const ogSend = interpreter.send.bind(interpreter);
  interpreter.send = (...args) => {
    assert(
      interpreter.status === InterpreterStatus.Running,
      'Interpreter is stopped',
    );
    return ogSend(...args);
  };
}
