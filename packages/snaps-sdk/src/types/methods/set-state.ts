import type { Json } from '@metamask/utils';

/**
 * The request parameters for the `snap_setState` method.
 *
 * @property key - The key of the state to update. If not provided, the entire
 * state is updated. This may contain Lodash-style path syntax, e.g.,
 * `a.b.c`, with the exception of array syntax.
 * @property value - The value to set the state to.
 * @property encrypted - Whether to use the separate encrypted state, or the
 * unencrypted state. Defaults to the encrypted state. Encrypted state can only
 * be used if the extension is unlocked, while unencrypted state can be used
 * whether the extension is locked or unlocked.
 */
export type SetStateParams = {
  key?: string;
  value: Json;
  encrypted?: boolean;
};

/**
 * The result returned by the `snap_setState` method.
 */
export type SetStateResult = null;
