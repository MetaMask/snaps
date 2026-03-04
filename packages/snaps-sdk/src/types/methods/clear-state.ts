/**
 * An object containing the parameters for the `snap_clearState` method.
 *
 * @property encrypted - Whether to use the separate encrypted state, or the
 * unencrypted state. Defaults to the encrypted state. Encrypted state can only
 * be used if the client is unlocked, while unencrypted state can be used
 * whether the client is locked or unlocked.
 *
 * Use the encrypted state for sensitive data (such as private keys or secrets),
 * and the unencrypted state for non-sensitive data that needs to be accessed
 * while the client is locked.
 */
export type ClearStateParams = {
  encrypted?: boolean;
};

/**
 * This method does not return any data, so the result is always `null`.
 */
export type ClearStateResult = null;
