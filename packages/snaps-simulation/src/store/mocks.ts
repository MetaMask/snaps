import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import type { ApplicationState } from './store';
import type { JsonRpcMockImplementation } from '../types';

export type JsonRpcMock = {
  id: string;
  implementation: JsonRpcMockImplementation;
  once?: boolean;
};

export type MocksState = {
  jsonRpc: Record<string, Omit<JsonRpcMock, 'id'>>;
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
      state.jsonRpc[action.payload.id] = {
        implementation: action.payload.implementation,
        once: action.payload.once,
      };
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
