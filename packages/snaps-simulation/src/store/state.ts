import type { PayloadAction } from '@reduxjs/toolkit';
import { createSelector, createSlice } from '@reduxjs/toolkit';

import type { ApplicationState } from './store';

/**
 * The Snap state object.
 *
 * @property encrypted - The encrypted state. Can be null if the Snap does not
 * have an encrypted state.
 * @property unencrypted - The unencrypted state. Can be null if the Snap does
 * not have an unencrypted state.
 */
export type State = {
  encrypted: string | null;
  unencrypted: string | null;
};

/**
 * The initial state.
 */
const INITIAL_STATE: State = {
  encrypted: null,
  unencrypted: null,
};

/**
 * The state slice, which stores the state of the Snap.
 */
export const stateSlice = createSlice({
  name: 'state',
  initialState: INITIAL_STATE,
  reducers: {
    setState: (
      state,
      action: PayloadAction<{ state: string | null; encrypted: boolean }>,
    ) => {
      if (action.payload.encrypted) {
        state.encrypted = action.payload.state;
        return state;
      }

      state.unencrypted = action.payload.state;
      return state;
    },
    clearState: (state, action: PayloadAction<{ encrypted: boolean }>) => {
      if (action.payload.encrypted) {
        state.encrypted = null;
        return state;
      }

      state.unencrypted = null;
      return state;
    },
  },
});

export const { setState, clearState } = stateSlice.actions;

/**
 * Get the state from the store.
 *
 * @param encrypted - Whether to get the encrypted or unencrypted state.
 * @returns A selector that returns the state.
 */
export function getState(encrypted: boolean) {
  return createSelector(
    (state: ApplicationState) => state,
    ({ state }) => {
      if (encrypted) {
        return state.encrypted;
      }

      return state.unencrypted;
    },
  );
}
