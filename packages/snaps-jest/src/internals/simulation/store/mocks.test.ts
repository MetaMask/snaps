import {
  addJsonRpcMock,
  getJsonRpcMock,
  getJsonRpcMocks,
  mocksSlice,
  removeJsonRpcMock,
} from './mocks';

describe('mocksSlice', () => {
  describe('addJsonRpcMock', () => {
    it('adds a JSON-RPC mock to the state', () => {
      const state = mocksSlice.reducer(
        {
          jsonRpc: {},
        },
        addJsonRpcMock({
          method: 'foo',
          result: 'bar',
        }),
      );

      expect(state).toStrictEqual({
        jsonRpc: {
          foo: 'bar',
        },
      });
    });
  });

  describe('removeJsonRpcMock', () => {
    it('removes a JSON-RPC mock from the state', () => {
      const state = mocksSlice.reducer(
        {
          jsonRpc: {
            foo: 'bar',
          },
        },
        removeJsonRpcMock('foo'),
      );

      expect(state).toStrictEqual({
        jsonRpc: {},
      });
    });
  });
});

describe('getJsonRpcMocks', () => {
  it('gets the JSON-RPC mocks from the state', () => {
    expect(
      // @ts-expect-error - Partially defined state.
      getJsonRpcMocks({
        mocks: {
          jsonRpc: {
            foo: 'bar',
          },
        },
      }),
    ).toStrictEqual({
      foo: 'bar',
    });
  });
});

describe('getJsonRpcMock', () => {
  it('gets a JSON-RPC mock from the state', () => {
    expect(
      getJsonRpcMock(
        // @ts-expect-error - Partially defined state.
        {
          mocks: {
            jsonRpc: {
              foo: 'bar',
            },
          },
        },
        'foo',
      ),
    ).toBe('bar');
  });
});
