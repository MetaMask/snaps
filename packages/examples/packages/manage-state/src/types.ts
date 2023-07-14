import type { State } from './utils';

/**
 * The parameters for the `setState` JSON-RPC method.
 *
 * The current state will be merged with the new state.
 */
export type SetStateParams = Partial<State>;
