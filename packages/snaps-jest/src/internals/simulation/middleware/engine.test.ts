import { createJsonRpcEngine } from './engine';

describe('createJsonRpcEngine', () => {
  it('creates a JSON-RPC engine', async () => {
    const engine = createJsonRpcEngine({
      hooks: {
        getMnemonic: jest.fn(),
        getSnapFile: jest.fn().mockResolvedValue('foo'),
      },
      permissionMiddleware: jest.fn(),
    });

    expect(engine).toBeDefined();
    expect(
      await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_getFile',
        params: {
          path: 'foo.json',
          encoding: 'utf8',
        },
      }),
    ).toStrictEqual({
      jsonrpc: '2.0',
      id: 1,
      result: 'foo',
    });
  });
});
