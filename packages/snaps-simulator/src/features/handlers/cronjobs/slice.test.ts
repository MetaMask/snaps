import {
  clearCronjobResponse,
  cronjob as reducer,
  INITIAL_STATE,
  setCronjobRequest,
  setCronjobRequestFromHistory,
  setCronjobResponse,
} from './slice';

describe('cronjobs', () => {
  describe('setCronjobRequest', () => {
    it('sets the request', () => {
      const result = reducer(
        INITIAL_STATE,
        setCronjobRequest({ origin: 'foo' }),
      );

      expect(result.request).toStrictEqual({ origin: 'foo' });
    });

    it('pushes the request to history', () => {
      const result = reducer(
        INITIAL_STATE,
        setCronjobRequest({ origin: 'foo' }),
      );

      expect(result.history).toStrictEqual([
        { date: expect.any(Date), request: { origin: 'foo' } },
      ]);
    });
  });

  describe('setCronjobRequestFromHistory', () => {
    it('sets the request', () => {
      const result = reducer(
        INITIAL_STATE,
        setCronjobRequestFromHistory({ origin: 'foo' }),
      );

      expect(result.request).toStrictEqual({ origin: 'foo' });
    });

    it('does not push to history', () => {
      const result = reducer(
        INITIAL_STATE,
        setCronjobRequestFromHistory({ origin: 'foo' }),
      );

      expect(result.history).toStrictEqual([]);
    });
  });

  describe('setCronjobResponse', () => {
    it('sets the response', () => {
      const result = reducer(INITIAL_STATE, setCronjobResponse('foo'));

      expect(result.response).toBe('foo');
    });
  });

  describe('clearResponse', () => {
    it('clears the response', () => {
      const result = reducer(
        {
          ...INITIAL_STATE,
          response: { jsonrpc: '2.0', id: null, result: 'foo' },
        },
        clearCronjobResponse(),
      );

      expect(result.response).toBeNull();
    });
  });
});
