import {
  combineReducers,
  createSelector,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';

import { api, snapsApi } from './api';
import type { ApplicationState } from './store';

const slice = createSlice({
  name: 'snaps',
  initialState: {
    snaps: 10,
  },
  reducers: {
    setSnaps(state, action: PayloadAction<number>) {
      state.snaps = action.payload;
    },
  },
});

export const { setSnaps } = slice.actions;

export const getSnaps = createSelector(
  (state: ApplicationState) => state.snaps,
  ({ snaps }) => snaps,
);

export const reducer = combineReducers({
  [api.reducerPath]: api.reducer,
  [snapsApi.reducerPath]: snapsApi.reducer,
  [slice.name]: slice.reducer,
});
