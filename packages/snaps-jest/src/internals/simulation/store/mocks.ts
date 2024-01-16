import type { Json } from '@metamask/utils';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSelector, createSlice } from '@reduxjs/toolkit';

import type { ApplicationState } from './store';

export type JsonRpcMock = {
  method: string;
  result: Json;
};

export type MocksState = {
  jsonRpc: Record<string, Json>;
};

/**
 * The initial notifications state.
 */
const INITIAL_STATE: MocksState = {
  jsonRpc: {},
};

export const mocksSlice = createSlice({
  name: 'mocks',
  initialState: INITIAL_STATE,
  reducers: {
    addJsonRpcMock: (state, action: PayloadAction<JsonRpcMock>) => {
      // @ts-expect-error - TS2589: Type instantiation is excessively deep and
      // possibly infinite.
      state.jsonRpc[action.payload.method] = action.payload.result;
    },
    removeJsonRpcMock: (state, action: PayloadAction<string>) => {
      delete state.jsonRpc[action.payload];
    },
  },
});

export const { addJsonRpcMock, removeJsonRpcMock } = mocksSlice.actions;

/**
 * Get the JSON-RPC mocks from the state.
 *
 * @param state - The application state.
 * @returns The JSON-RPC mocks.
 */
export const getJsonRpcMocks = (state: ApplicationState) => state.mocks.jsonRpc;

/**
 * Get the JSON-RPC mock for a given method from the state.
 */
export const getJsonRpcMock = createSelector(
  getJsonRpcMocks,
  (_: unknown, method: string) => method,
  (jsonRpcMocks, method) => jsonRpcMocks[method],
);
