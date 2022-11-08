import { assertIsJsonRpcSuccess } from './json-rpc';

describe('assertIsJsonRpcSuccess', () => {
  it.each([
    {
      id: 1,
      jsonrpc: '2.0',
      result: 'foo',
    },
    {
      id: '1',
      jsonrpc: '2.0',
      result: {
        foo: 'bar',
      },
    },
    {
      id: 'foo',
      jsonrpc: '2.0',
      result: null,
    },
    {
      id: 1,
      jsonrpc: '2.0',
      result: [
        {
          foo: 'bar',
        },
      ],
    },
  ])(
    'does not throw if the value is a JSON-RPC success response',
    (response) => {
      expect(() => {
        assertIsJsonRpcSuccess(response);
      }).not.toThrow();
    },
  );

  it.each([
    {},
    [],
    true,
    false,
    null,
    undefined,
    1,
    'foo',
    {
      jsonrpc: '2.0',
      result: 'foo',
    },
    {
      id: 1,
      result: 'foo',
    },
    {
      id: 1,
      jsonrpc: '2.0',
    },
    {
      id: 1,
      jsonrpc: '1.0',
      result: 'foo',
    },
    {
      id: 1,
      jsonrpc: 2.0,
      result: 'foo',
    },
    {
      id: 1,
      jsonrpc: '2.0',
      result: undefined,
    },
    {
      id: {},
      jsonrpc: '2.0',
      result: 'foo',
    },
    {
      id: [],
      jsonrpc: '2.0',
      result: 'foo',
    },
    {
      id: true,
      jsonrpc: '2.0',
      result: 'foo',
    },
    {
      id: false,
      jsonrpc: '2.0',
      result: 'foo',
    },
    {
      id: undefined,
      jsonrpc: '2.0',
      result: 'foo',
    },
  ])('throws if the value is not a JSON-RPC success response', (response) => {
    expect(() => {
      assertIsJsonRpcSuccess(response);
    }).toThrow('Invalid JSON-RPC response.');
  });

  it('throws the message if the value is a JSON-RPC error response', () => {
    expect(() => {
      assertIsJsonRpcSuccess({
        jsonrpc: '2.0',
        id: 1,
        error: { code: -1, message: 'foo' },
      });
    }).toThrow('JSON-RPC request failed: foo');
  });
});
