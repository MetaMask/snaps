import type { Json } from '@metamask/utils';

/**
 * An object containing the parameters for the `snap_getState` method.
 *
 * @property key - The key of the state to retrieve. If not provided, the entire
 * state is retrieved. This may contain Lodash-style path syntax, e.g.,
 * `a.b.c`, with the exception of array syntax.
 * @property encrypted - Whether to use the separate encrypted state, or the
 * unencrypted state. Defaults to the encrypted state. Encrypted state can only
 * be used if the client is unlocked, while unencrypted state can be used
 * whether the client is locked or unlocked.
 */
export type GetStateParams = {
  key?: string;
  encrypted?: boolean;
};

/**
 * The state of the Snap. If a key was provided in the request parameters, this
 * is the value of that key in the state. Otherwise, this is the entire state.
 */
export type GetStateResult = Json;
