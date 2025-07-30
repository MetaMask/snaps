import type { TrackedError, TrackedEvent } from './trackables';
import { trackablesSlice, trackError } from './trackables';

describe('trackablesSlice', () => {
  describe('trackError', () => {
    it('adds an error to the state', () => {
      const initialState = {
        events: [],
        errors: [],
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
      };

      const state = trackablesSlice.reducer(
        initialState,
        trackablesSlice.actions.clearTrackables(),
      );

      expect(state.events).toHaveLength(0);
      expect(state.errors).toHaveLength(0);
    });
  });
});
