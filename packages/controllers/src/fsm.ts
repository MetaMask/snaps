import {
  EventObject,
  InterpreterStatus,
  StateMachine,
  Typestate,
} from '@xstate/fsm';
import { InitEvent } from '@xstate/fsm/lib/types';
import { Mutex } from 'async-mutex';

async function executeActionsAsync<
  TContext extends object,
  TEvent extends EventObject = EventObject,
  TState extends Typestate<TContext> = { value: any; context: TContext },
>(
  state: StateMachine.State<TContext, TEvent, TState>,
  event: TEvent | InitEvent,
): Promise<void> {
  for (const { exec } of state.actions) {
    exec && (await exec(state.context, event));
  }
}

function createMatcher(value: string) {
  return (stateValue: any) => value === stateValue;
}

export interface InterpreterAsync<
  TContext extends object,
  TEvent extends EventObject = EventObject,
  TState extends Typestate<TContext> = { value: any; context: TContext },
> {
  send(event: TEvent | TEvent['type']): Promise<void>;
  start(
    initialState?:
      | TState['value']
      | { context: TContext; value: TState['value'] },
  ): Promise<this>;
  subscribe(
    listener: StateMachine.StateListener<
      StateMachine.State<TContext, TEvent, TState>
    >,
  ): { unsubscribe: () => void };
  stop(): void;
  state(): Promise<StateMachine.State<TContext, TEvent, TState>>;
  get status(): InterpreterStatus;
}

/**
 * This is an xstate/fsm-like interpreter which also supports async actions
 * Actions are executed in order they appear and wait for previous one to finish before execution.
 *
 * Only after all actions finish, will subscribers be notified.
 *
 * This interpreter is **strict**.
 * If no transition is possible, an error will be thrown.
 */
// TODO(ritave): Support async guards, would be useful to check for latest block status info when unblocking a snap
export function interpretAsync<
  TContext extends object,
  TEvent extends EventObject = EventObject,
  TState extends Typestate<TContext> = { value: any; context: TContext },
>(
  machine: StateMachine.Machine<TContext, TEvent, TState>,
): InterpreterAsync<TContext, TEvent, TState> {
  let state = machine.initialState;
  let status = InterpreterStatus.NotStarted;
  const listeners = new Set<StateMachine.StateListener<typeof state>>();
  const transitionMutex = new Mutex(
    new Error('The machine has been stopped while operations were pending'),
  );

  const service = {
    send: async (event: TEvent | TEvent['type']): Promise<void> => {
      if (status !== InterpreterStatus.Running) {
        throw new Error("Can't send events to not-running state machine");
      }

      const newState = await transitionMutex.runExclusive(async () => {
        state = machine.transition(state, event);
        if (!state.changed) {
          throw new Error('Invalid state transition or guards failed');
        }
        const resolved = (
          typeof event === 'string' ? { type: event } : event
        ) as TEvent;

        await executeActionsAsync(state, resolved);

        return state;
      });

      // The state has been transitioned, but listeners might still bubble up errors
      listeners.forEach((listener) => listener(newState));
    },
    start: async (
      initialState?:
        | TState['value']
        | { context: TContext; value: TState['value'] },
    ) => {
      if (status === InterpreterStatus.Running) {
        throw new Error("Can't start an already started state machine");
      }
      let newState: typeof state;
      try {
        newState = await transitionMutex.runExclusive(async () => {
          if (initialState) {
            const resolved =
              typeof initialState === 'object'
                ? initialState
                : { context: machine.config.context!, value: initialState };
            state = {
              value: resolved.value,
              actions: [],
              context: resolved.context,
              matches: createMatcher(resolved.value),
            };
          } else {
            state = machine.initialState;
          }

          status = InterpreterStatus.Running;

          await executeActionsAsync(state, { type: 'xstate.init' });
          return state;
        });
      } catch (e) {
        service.stop();
        throw e;
      }

      listeners.forEach((listener) => listener(newState));

      return service;
    },
    stop: () => {
      transitionMutex.cancel();
      status = InterpreterStatus.Stopped;
      listeners.clear();
      return service;
    },
    subscribe: (listener: StateMachine.StateListener<typeof state>) => {
      listeners.add(listener);
      return { unsubscribe: () => listeners.delete(listener) };
    },
    state: async () => {
      return transitionMutex.runExclusive(() => state);
    },
    get status() {
      return status;
    },
  };
  return service;
}
