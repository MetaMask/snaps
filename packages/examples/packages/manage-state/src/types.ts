import type { State } from './utils';

export type BaseParams = { encrypted?: boolean };

/**
 * The parameters for the `setState` JSON-RPC method.
 *
 * The current state will be merged with the new state.
 */
export type SetStateParams = BaseParams & Partial<State>;
