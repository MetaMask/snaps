import { HandlerType } from '@metamask/snaps-utils';
import type { JsonRpcRequest } from '@metamask/utils';
import { createSelector } from '@reduxjs/toolkit';

import { createHandlerSlice } from '../slice';

type Request = {
  request?: JsonRpcRequest;
};

type Response = null;

export const INITIAL_STATE = {
  request: {},
  response: null,
  history: [],
};

const slice = createHandlerSlice<Request, Response>({
  name: HandlerType.OnUserInput,
  initialState: INITIAL_STATE,
});

export const userInput = slice.reducer;
export const {
  setRequest: setUserInputRequest,
  setRequestFromHistory: setUserInputRequestFromHistory,
  clearResponse: clearUserInputResponse,
} = slice.actions;

export const getUserInputRequest = createSelector(
  (state: {
    [HandlerType.OnUserInput]: ReturnType<(typeof slice)['getInitialState']>;
  }) => state[HandlerType.OnUserInput],
  (state) => state.request,
);
