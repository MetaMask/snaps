/**
 * An object containing the parameters for the `snap_clearState` method.
 *
 * @property encrypted - Whether to use the separate encrypted state, or the
 * unencrypted state. Defaults to the encrypted state. Encrypted state can only
 * be used if the extension is unlocked, while unencrypted state can be used
 * whether the extension is locked or unlocked.
 */
export type ClearStateParams = {
  encrypted?: boolean;
};

/**
 * This method does not return any data, so the result is always `null`.
 */
export type ClearStateResult = null;
