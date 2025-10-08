import {
  addJsonRpcMock,
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
          id: 'foo',
          implementation: () => 'bar',
          once: false,
        }),
      );

      expect(state).toStrictEqual({
        jsonRpc: {
          foo: {
            implementation: expect.any(Function),
            once: false,
          },
        },
      });
    });
  });

  describe('removeJsonRpcMock', () => {
    it('removes a JSON-RPC mock from the state', () => {
      const state = mocksSlice.reducer(
        {
          jsonRpc: {
            foo: {
              implementation: () => 'bar',
              once: false,
            },
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
            foo: {
              implementation: () => 'bar',
              once: false,
            },
          },
        },
      }),
    ).toStrictEqual({
      foo: {
        implementation: expect.any(Function),
        once: false,
      },
    });
  });
});
