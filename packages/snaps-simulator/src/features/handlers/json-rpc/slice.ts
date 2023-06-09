import { HandlerType } from '@metamask/snaps-utils';
import { JsonRpcRequest } from '@metamask/utils';
import { createSelector } from '@reduxjs/toolkit';

import { createHandlerSlice } from '../slice';

type Request = {
  origin: string;
  request?: JsonRpcRequest;
};

type Response = string;

export const INITIAL_STATE = {
  request: {
    origin: '',
  },
  response: null,
  history: [],
};

const slice = createHandlerSlice<Request, Response>({
  name: HandlerType.OnRpcRequest,
  initialState: INITIAL_STATE,
});

export const jsonRpc = slice.reducer;
export const {
  setRequest: setJsonRpcRequest,
  setRequestFromHistory: setJsonRpcRequestFromHistory,
  setResponse: setJsonRpcResponse,
} = slice.actions;

export const getJsonRpcRequest = createSelector(
  (state: {
    [HandlerType.OnRpcRequest]: ReturnType<typeof slice['getInitialState']>;
  }) => state[HandlerType.OnRpcRequest],
  (state) => state.request,
);
