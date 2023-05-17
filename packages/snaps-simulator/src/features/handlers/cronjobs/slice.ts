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
  name: HandlerType.OnCronjob,
  initialState: INITIAL_STATE,
});

export const cronjob = slice.reducer;
export const {
  setRequest: setCronjobRequest,
  setRequestFromHistory: setCronjobRequestFromHistory,
  setResponse: setCronjobResponse,
} = slice.actions;

export const getCronjobRequest = createSelector(
  (state: {
    [HandlerType.OnCronjob]: ReturnType<typeof slice['getInitialState']>;
  }) => state[HandlerType.OnCronjob],
  (state) => state.request,
);
