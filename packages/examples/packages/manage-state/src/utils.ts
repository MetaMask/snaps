import { ManageStateOperation } from '@metamask/snaps-types';

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
 * @returns The current state of the snap.
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#snap_managestate
 */
export async function getState(): Promise<State> {
  const state = await snap.request({
    method: 'snap_manageState',

    // For this particular example, we use the `ManageStateOperation.GetState`
    // enum value, but you can also use the string value `'get'` instead.
    params: { operation: ManageStateOperation.GetState },
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
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#snap_managestate
 */
export async function setState(newState: State) {
  await snap.request({
    method: 'snap_manageState',

    // For this particular example, we use the `ManageStateOperation.UpdateState`
    // enum value, but you can also use the string value `'update'` instead.
    params: { operation: ManageStateOperation.UpdateState, newState },
  });
}

/**
 * Clear the state of the snap. This will set the state to the
 * {@link DEFAULT_STATE}.
 *
 * This uses the `snap_manageState` JSON-RPC method to clear the state.
 *
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#snap_managestate
 */
export async function clearState() {
  await snap.request({
    method: 'snap_manageState',

    // For this particular example, we use the `ManageStateOperation.ClearState`
    // enum value, but you can also use the string value `'clear'` instead.
    params: { operation: ManageStateOperation.ClearState },
  });
}
