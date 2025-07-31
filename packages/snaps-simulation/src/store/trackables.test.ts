import type { TrackablesState, TrackedError, TrackedEvent } from './trackables';
import { trackablesSlice, trackError } from './trackables';

describe('trackablesSlice', () => {
  describe('trackError', () => {
    it('adds an error to the state', () => {
      const initialState = {
        events: [],
        errors: [],
        traces: [],
        pendingTraces: [],
      };

      const error: TrackedError = {
        name: 'TestError',
        message: 'Test error',
        stack: 'Error stack trace',
        cause: null,
      };

      const state = trackablesSlice.reducer(initialState, trackError(error));

      expect(state.errors).toHaveLength(1);
      expect(state.errors[0]).toStrictEqual(error);
    });
  });

  describe('trackEvent', () => {
    it('adds an event to the state', () => {
      const initialState = {
        events: [],
        errors: [],
        traces: [],
        pendingTraces: [],
      };

      const event: TrackedEvent = {
        event: 'TestEvent',
        properties: { key: 'value' },
      };

      const state = trackablesSlice.reducer(
        initialState,
        trackablesSlice.actions.trackEvent(event),
      );

      expect(state.events).toHaveLength(1);
      expect(state.events[0]).toStrictEqual(event);
    });
  });

  describe('startTrace', () => {
    it('adds a trace to the pending traces state', () => {
      const initialState = {
        events: [],
        errors: [],
        traces: [],
        pendingTraces: [],
      };

      const trace = {
        id: '123',
        name: 'Test Trace',
      };

      const state = trackablesSlice.reducer(
        initialState,
        trackablesSlice.actions.startTrace(trace),
      );

      expect(state.pendingTraces).toHaveLength(1);
      expect(state.pendingTraces[0]).toStrictEqual(trace);
    });
  });

  describe('endTrace', () => {
    it('moves a trace from pending to traces state', () => {
      const initialState = {
        events: [],
        errors: [],
        traces: [],
        pendingTraces: [
          {
            id: '123',
            name: 'Pending Trace',
          },
          {
            id: '456',
            name: 'Another Pending Trace',
          },
        ],
      };

      const trace = {
        id: '123',
        name: 'Pending Trace',
      };

      const state = trackablesSlice.reducer(
        initialState,
        trackablesSlice.actions.endTrace(trace),
      );

      expect(state.pendingTraces).toHaveLength(1);
      expect(state.pendingTraces).not.toContainEqual(trace);
      expect(state.traces).toHaveLength(1);
      expect(state.traces[0]).toStrictEqual(trace);
    });

    it('works in last in first out order', () => {
      const initialState: TrackablesState = {
        events: [],
        errors: [],
        traces: [],
        pendingTraces: [
          {
            id: '123',
            name: 'Pending Trace',
            tags: {
              'test-tag': 'test-value',
            },
          },
          {
            id: '123',
            name: 'Pending Trace',
            tags: {
              'other-tag': 'other-value',
            },
          },
        ],
      };

      const trace = {
        id: '123',
        name: 'Pending Trace',
      };

      const state = trackablesSlice.reducer(
        initialState,
        trackablesSlice.actions.endTrace(trace),
      );

      expect(state.pendingTraces).toHaveLength(1);
      expect(state.pendingTraces[0].id).toBe('123');
      expect(state.traces).toHaveLength(1);
      expect(state.traces[0]).toStrictEqual({
        id: '123',
        name: 'Pending Trace',
        tags: {
          'other-tag': 'other-value',
        },
      });
    });

    it('does not modify state if trace is not found in pending traces', () => {
      const initialState = {
        events: [],
        errors: [],
        traces: [],
        pendingTraces: [
          {
            id: '123',
            name: 'Pending Trace',
          },
        ],
      };

      const trace = {
        id: '999',
        name: 'Non-existent Trace',
      };

      const state = trackablesSlice.reducer(
        initialState,
        trackablesSlice.actions.endTrace(trace),
      );

      expect(state.pendingTraces).toHaveLength(1);
      expect(state.traces).toHaveLength(0);
    });
  });

  describe('clearTrackables', () => {
    it('clears all events and errors from the state', () => {
      const initialState = {
        events: [{ event: 'TestEvent', properties: {} }],
        errors: [
          {
            name: 'TestError',
            message: 'Test error',
            stack: 'Error stack trace',
            cause: null,
          },
        ],
        traces: [
          {
            name: 'Test Trace',
          },
        ],
        pendingTraces: [
          {
            id: '123',
            name: 'Pending Trace',
          },
        ],
      };

      const state = trackablesSlice.reducer(
        initialState,
        trackablesSlice.actions.clearTrackables(),
      );

      expect(state.events).toHaveLength(0);
      expect(state.errors).toHaveLength(0);
      expect(state.traces).toHaveLength(0);
      expect(state.pendingTraces).toHaveLength(0);
    });
  });
});
