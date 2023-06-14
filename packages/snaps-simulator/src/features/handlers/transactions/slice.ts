import { HandlerType } from '@metamask/snaps-utils';
import { JsonRpcRequest, JsonRpcResponse, Json } from '@metamask/utils';
import { createSelector } from '@reduxjs/toolkit';

import { createHandlerSlice } from '../slice';

type Request = {
  request?: JsonRpcRequest<{
    chainId: string;
    transaction: Record<string, any>;
    transactionOrigin?: string;
  }>;
};

type Response = JsonRpcResponse<Json>;

export const INITIAL_STATE = {
  request: {},
  response: null,
  history: [],
};

const slice = createHandlerSlice<Request, Response>({
  name: HandlerType.OnTransaction,
  initialState: INITIAL_STATE,
});

export const transactions = slice.reducer;
export const {
  setRequest: setTransactionRequest,
  setRequestFromHistory: setTransactionRequestFromHistory,
  setResponse: setTransactionResponse,
} = slice.actions;

export const getTransactionRequest = createSelector(
  (state: {
    [HandlerType.OnTransaction]: ReturnType<typeof slice['getInitialState']>;
  }) => state[HandlerType.OnTransaction],
  (state) => state.request,
);
