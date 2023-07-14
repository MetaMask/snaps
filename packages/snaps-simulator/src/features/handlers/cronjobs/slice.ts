import { HandlerType } from '@metamask/snaps-utils';
import type { JsonRpcRequest, JsonRpcResponse, Json } from '@metamask/utils';
import { createSelector } from '@reduxjs/toolkit';

import { createHandlerSlice } from '../slice';

type Request = {
  origin: string;
  request?: JsonRpcRequest;
};

type Response = JsonRpcResponse<Json>;

export const INITIAL_STATE = {
  request: {
    origin: '',
  },
  response: null,
  history: [],
};

const slice = createHandlerSlice<Request, Response>({
  name: HandlerType.OnCronjob,
  initialState: INITIAL_STATE,
});

export const cronjob = slice.reducer;
export const {
  setRequest: setCronjobRequest,
  setRequestFromHistory: setCronjobRequestFromHistory,
  setResponse: setCronjobResponse,
  clearResponse: clearCronjobResponse,
} = slice.actions;

export const getCronjobRequest = createSelector(
  (state: {
    [HandlerType.OnCronjob]: ReturnType<typeof slice['getInitialState']>;
  }) => state[HandlerType.OnCronjob],
  (state) => state.request,
);
