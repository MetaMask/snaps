import type { EventObject, StateMachine, Typestate } from '@xstate/fsm';
/**
 * Validates the set-up of a @xstate/fsm machine.
 *
 * 1. Ensures that all named actions in the config have a provided implementation.
 *
 * @param machine - The machine to validate.
 * @throws {@link AssertionError}. If the validation fails.
 */
export declare function validateMachine<TContext extends object, TEvent extends EventObject, TState extends Typestate<TContext>>(machine: StateMachine.Machine<TContext, TEvent, TState>): void;
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
export declare function forceStrict(interpreter: StateMachine.Service<any, any, any>): void;
