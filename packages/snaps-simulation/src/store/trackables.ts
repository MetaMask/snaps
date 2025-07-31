import type {
  EndTraceParams,
  TraceRequest,
  TrackErrorParams,
  TrackEventParams,
} from '@metamask/snaps-sdk';
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

  /**
   * An array of performance traces.
   */
  traces: TraceRequest[];

  /**
   * An array of pending traces that have not yet been ended.
   */
  pendingTraces: TraceRequest[];
};

/**
 * The initial events state.
 */
const INITIAL_STATE: TrackablesState = {
  events: [],
  errors: [],
  traces: [],
  pendingTraces: [],
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
    startTrace: (state, action: PayloadAction<TraceRequest>) => {
      const trace = castDraft(action.payload);
      state.pendingTraces.push(trace);
    },
    endTrace: (state, action: PayloadAction<EndTraceParams>) => {
      const endTrace = castDraft(action.payload);
      const index = state.pendingTraces.findIndex(
        (pendingTrace) =>
          pendingTrace.id === endTrace.id &&
          pendingTrace.name === endTrace.name,
      );

      if (index !== -1) {
        const pendingTrace = state.pendingTraces[index];
        state.pendingTraces.splice(index, 1);
        state.traces.push(pendingTrace);
      }
    },
    clearTrackables: (state) => {
      state.events = [];
      state.errors = [];
      state.traces = [];
      state.pendingTraces = [];
    },
  },
});

export const { trackError, trackEvent, startTrace, endTrace, clearTrackables } =
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

/**
 * Get the traces from the state. This only includes traces that have been
 * ended, not pending traces.
 *
 * @param state - The application state.
 * @returns An array of traces.
 */
export const getTraces = createSelector(
  (state: ApplicationState) => state.trackables,
  ({ traces }) => traces,
);
