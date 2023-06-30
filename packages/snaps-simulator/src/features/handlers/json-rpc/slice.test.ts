import {
  jsonRpc as reducer,
  setJsonRpcRequest,
  setJsonRpcResponse,
  INITIAL_STATE,
  setJsonRpcRequestFromHistory,
  clearJsonRpcResponse,
} from './slice';

describe('jsonRpc', () => {
  describe('setJsonRpcRequest', () => {
    it('sets the request', () => {
      const result = reducer(
        INITIAL_STATE,
        setJsonRpcRequest({ origin: 'foo' }),
      );

      expect(result.request).toStrictEqual({ origin: 'foo' });
    });

    it('pushes the request to history', () => {
      const result = reducer(
        INITIAL_STATE,
        setJsonRpcRequest({ origin: 'foo' }),
      );

      expect(result.history).toStrictEqual([
        { date: expect.any(Date), request: { origin: 'foo' } },
      ]);
    });
  });

  describe('setJsonRpcRequestFromHistory', () => {
    it('sets the request', () => {
      const result = reducer(
        INITIAL_STATE,
        setJsonRpcRequestFromHistory({ origin: 'foo' }),
      );

      expect(result.request).toStrictEqual({ origin: 'foo' });
    });

    it('does not push to history', () => {
      const result = reducer(
        INITIAL_STATE,
        setJsonRpcRequestFromHistory({ origin: 'foo' }),
      );

      expect(result.history).toStrictEqual([]);
    });
  });

  describe('setJsonRpcResponse', () => {
    it('sets the response', () => {
      const result = reducer(INITIAL_STATE, setJsonRpcResponse('foo'));

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
        clearJsonRpcResponse(),
      );

      expect(result.response).toBeNull();
    });
  });
});
