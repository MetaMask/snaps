import type { Json } from '@metamask/utils';

/**
 * The request parameters for the `snap_setState` method.
 *
 * @property key - The key or keys of the state to update. If not provided, the
 * entire state is updated. This may contain Lodash-style path syntax, for
 * example, `a.b.c`, with the exception of array syntax. If an array of keys is
 * provided, the value must be an object mapping each key to its new value.
 * @property value - The value to set the state to. If `key` is an array, this
 * must be an object mapping each key to its new value.
 * @property encrypted - Whether to use the separate encrypted state, or the
 * unencrypted state. Defaults to the encrypted state. Encrypted state can only
 * be used if the client is unlocked, while unencrypted state can be used
 * whether the client is locked or unlocked.
 *
 * Use the encrypted state for sensitive data (such as private keys or secrets),
 * and the unencrypted state for non-sensitive data that needs to be accessed
 * while the client is locked.
 */
export type SetStateParams = {
  key?: string | string[];
  value: Json;
  encrypted?: boolean;
};

/**
 * This method does not return any data, so the result is always `null`.
 */
export type SetStateResult = null;
