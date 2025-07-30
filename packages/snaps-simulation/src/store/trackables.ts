import type { TrackErrorParams, TrackEventParams } from '@metamask/snaps-sdk';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSelector, createSlice } from '@reduxjs/toolkit';
import { castDraft } from 'immer';

import type { ApplicationState } from './store';

export type TrackedEvent = TrackEventParams['event'];

export type TrackedError = TrackErrorParams['error'];

/**
 * The trackables state.
 */
export type TrackablesState = {
  /**
   * An array of tracked events.
   */
  events: TrackedEvent[];

  /**
   * An array of tracked errors.
   */
  errors: TrackedError[];
};

/**
 * The initial events state.
 */
const INITIAL_STATE: TrackablesState = {
  events: [],
  errors: [],
};

export const trackablesSlice = createSlice({
  name: 'trackables',
  initialState: INITIAL_STATE,
  reducers: {
    trackError: (state, action: PayloadAction<TrackedError>) => {
      state.errors.push(castDraft(action.payload));
    },
    trackEvent: (state, action: PayloadAction<TrackedEvent>) => {
      state.events.push(castDraft(action.payload));
    },
    clearTrackables: (state) => {
      state.events = [];
      state.errors = [];
    },
  },
});

export const { trackError, trackEvent, clearTrackables } =
  trackablesSlice.actions;

/**
 * Get the errors from the state.
 *
 * @param state - The application state.
 * @returns An array of errors.
 */
export const getErrors = createSelector(
  (state: ApplicationState) => state.trackables,
  ({ errors }) => errors,
);

/**
 * Get the events from the state.
 *
 * @param state - The application state.
 * @returns An array of events.
 */
export const getEvents = createSelector(
  (state: ApplicationState) => state.trackables,
  ({ events }) => events,
);
