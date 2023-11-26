import type { Json } from '@metamask/utils';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSelector, createSlice } from '@reduxjs/toolkit';

import type { ApplicationState } from './store';

export type StateEntry = string | Record<string, Json>;

/**
 * The Snap state object.
 *
 * @property encrypted - The encrypted state. Can be null if the Snap does not
 * have an encrypted state.
 * @property unencrypted - The unencrypted state. Can be null if the Snap does
 * not have an unencrypted state.
 */
export type State = {
  encrypted: StateEntry | null;
  unencrypted: StateEntry | null;
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
      action: PayloadAction<{ state: StateEntry | null; encrypted: boolean }>,
    ) => {
      if (action.payload.encrypted) {
        // @ts-expect-error - TS2589: Type instantiation is excessively deep and
        // possibly infinite.
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
