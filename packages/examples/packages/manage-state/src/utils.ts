import { ManageStateOperation } from '@metamask/snaps-sdk';

export type State = {
  items: string[];
};

/**
 * The default state of the snap. This is returned by the {@link getState}
 * function if the state has not been set yet.
 */
const DEFAULT_STATE = {
  items: [],
};

/**
 * Get the current state of the snap. If the snap does not have state, the
 * {@link DEFAULT_STATE} is returned instead.
 *
 * This uses the `snap_manageState` JSON-RPC method to get the state.
 *
 * @param encrypted - An optional flag to indicate whether to use encrypted storage or not.
 * @returns The current state of the snap.
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#snap_managestate
 */
export async function getState(encrypted?: boolean): Promise<State> {
  const state = await snap.request({
    method: 'snap_manageState',

    params: {
      // For this particular example, we use the `ManageStateOperation.GetState`
      // enum value, but you can also use the string value `'get'` instead.
      operation: ManageStateOperation.GetState,

      // By default all state is encrypted, but you can choose to not encrypt it.
      // To do this you may set this flag to false.
      // This will use a separate unencrypted storage from the encrypted state.
      encrypted,
    },
  });

  // If the snap does not have state, `state` will be `null`. Instead, we return
  // the default state.
  return (state as State | null) ?? DEFAULT_STATE;
}

/**
 * Set the state of the snap. This will overwrite the current state.
 *
 * This uses the `snap_manageState` JSON-RPC method to set the state. The state
 * is encrypted with the user's secret recovery phrase and stored in the user's
 * browser.
 *
 * @param newState - The new state of the snap.
 * @param encrypted - An optional flag to indicate whether to use encrypted
 * storage or not. Unencrypted storage does not require the user to unlock
 * MetaMask in order to access it, but it should not be used for sensitive data.
 * Defaults to true.
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#snap_managestate
 */
export async function setState(newState: State, encrypted?: boolean) {
  await snap.request({
    method: 'snap_manageState',

    params: {
      // For this particular example, we use the `ManageStateOperation.UpdateState`
      // enum value, but you can also use the string value `'update'` instead.
      operation: ManageStateOperation.UpdateState,
      newState,

      // By default all state is encrypted, but you can choose to not encrypt it.
      // To do this you may set this flag to false.
      // This will use a separate unencrypted storage from the encrypted state.
      encrypted,
    },
  });
}

/**
 * Clear the state of the snap. This will set the state to the
 * {@link DEFAULT_STATE}.
 *
 * This uses the `snap_manageState` JSON-RPC method to clear the state.
 *
 * @param encrypted - An optional flag to indicate whether to use encrypted storage or not.
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#snap_managestate
 */
export async function clearState(encrypted?: boolean) {
  await snap.request({
    method: 'snap_manageState',

    // For this particular example, we use the `ManageStateOperation.ClearState`
    // enum value, but you can also use the string value `'clear'` instead.
    params: {
      operation: ManageStateOperation.ClearState,

      // By default all state is encrypted, but you can choose to not encrypt it.
      // To do this you may set this flag to false.
      // This will use a separate unencrypted storage from the encrypted state.
      encrypted,
    },
  });
}
