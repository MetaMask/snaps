import { createStore } from '../store';
import { getMockOptions } from '../test-utils';
import { createJsonRpcEngine } from './engine';

describe('createJsonRpcEngine', () => {
  it('creates a JSON-RPC engine', async () => {
    const { store } = createStore(getMockOptions());
    const engine = createJsonRpcEngine({
      store,
      restrictedHooks: {
        getMnemonic: jest.fn(),
        getIsLocked: jest.fn(),
        getClientCryptography: jest.fn(),
      },
      permittedHooks: {
        getSnapFile: jest.fn().mockResolvedValue('foo'),
        getSnapState: jest.fn(),
        updateSnapState: jest.fn(),
        clearSnapState: jest.fn(),
        getInterfaceState: jest.fn(),
        getInterfaceContext: jest.fn(),
        createInterface: jest.fn(),
        updateInterface: jest.fn(),
        resolveInterface: jest.fn(),
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
