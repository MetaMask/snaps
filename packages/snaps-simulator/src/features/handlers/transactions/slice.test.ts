import {
  transactions as reducer,
  setTransactionRequest,
  INITIAL_STATE,
  setTransactionResponse,
  setTransactionRequestFromHistory,
  clearTransactionResponse,
} from './slice';

describe('transactions', () => {
  describe('setTransactionRequest', () => {
    it('sets the request', () => {
      const result = reducer(
        INITIAL_STATE,
        setTransactionRequest({
          request: {
            jsonrpc: '2.0',
            id: '1',
            method: 'foo',
            params: {
              chainId: 'eip155:1',
              transaction: {
                value: '0x00',
              },
            },
          },
        }),
      );

      expect(result.request).toStrictEqual({
        request: {
          jsonrpc: '2.0',
          id: '1',
          method: 'foo',
          params: {
            chainId: 'eip155:1',
            transaction: {
              value: '0x00',
            },
          },
        },
      });
    });

    it('pushes the request to history', () => {
      const result = reducer(
        INITIAL_STATE,
        setTransactionRequest({
          request: {
            jsonrpc: '2.0',
            id: '1',
            method: 'foo',
            params: {
              chainId: 'eip155:1',
              transaction: {
                value: '0x00',
              },
            },
          },
        }),
      );

      expect(result.history).toStrictEqual([
        {
          date: expect.any(Date),
          request: {
            request: {
              jsonrpc: '2.0',
              id: '1',
              method: 'foo',
              params: {
                chainId: 'eip155:1',
                transaction: {
                  value: '0x00',
                },
              },
            },
          },
        },
      ]);
    });
  });

  describe('setTransactionRequestFromHistory', () => {
    it('sets the request', () => {
      const result = reducer(
        INITIAL_STATE,
        setTransactionRequestFromHistory({
          request: {
            jsonrpc: '2.0',
            id: '1',
            method: 'foo',
            params: {
              chainId: 'eip155:1',
              transaction: {
                value: '0x00',
              },
            },
          },
        }),
      );

      expect(result.request).toStrictEqual({
        request: {
          jsonrpc: '2.0',
          id: '1',
          method: 'foo',
          params: {
            chainId: 'eip155:1',
            transaction: {
              value: '0x00',
            },
          },
        },
      });
    });

    it('does not push to history', () => {
      const result = reducer(
        INITIAL_STATE,
        setTransactionRequestFromHistory({
          request: {
            jsonrpc: '2.0',
            id: '1',
            method: 'foo',
            params: {
              chainId: 'eip155:1',
              transaction: {
                value: '0x00',
              },
            },
          },
        }),
      );

      expect(result.history).toStrictEqual([]);
    });
  });

  describe('setTransactionResponse', () => {
    it('sets the response', () => {
      const result = reducer(INITIAL_STATE, setTransactionResponse('foo'));

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
        clearTransactionResponse(),
      );

      expect(result.response).toBeNull();
    });
  });
});
