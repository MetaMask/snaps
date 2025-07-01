import { JsonRpcEngine } from '@metamask/json-rpc-engine';

import { createPreinstalledSnapsMiddleware } from './preinstalled-snaps';
import { SnapEndowments } from '../endowments';

describe('createPreinstalledSnapsMiddleware', () => {
  it('grants permissions for accounts not already permitted', async () => {
    const hooks = {
      getAllEvmAccounts: jest
        .fn()
        .mockReturnValue(['0x1234567890123456789012345678901234567890']),
      getPermissions: jest
        .fn()
        .mockReturnValue({ [SnapEndowments.EthereumProvider]: {} }),
      grantPermissions: jest.fn(),
    };

    const middleware = createPreinstalledSnapsMiddleware(hooks);

    const engine = new JsonRpcEngine();

    engine.push(middleware);

    const request = {
      jsonrpc: '2.0' as const,
      id: 1,
      method: 'eth_signTypedData_v4',
      params: {},
    };

    // Since we only have one middleware, this will return an error on a successful test.
    expect(await engine.handle(request)).toStrictEqual({
      id: 1,
      jsonrpc: '2.0',
      error: {
        code: -32603,
        data: {
          cause: null,
          request: {
            id: 1,
            jsonrpc: '2.0',
            method: 'eth_signTypedData_v4',
            params: {},
          },
        },
        message: expect.stringContaining(
          'JsonRpcEngine: Response has no error or result for request',
        ),
        stack: expect.stringContaining(
          'JsonRpcEngine: Response has no error or result for request',
        ),
      },
    });

    expect(hooks.grantPermissions).toHaveBeenCalledWith({
      'endowment:caip25': {
        caveats: [
          {
            type: 'authorizedScopes',
            value: {
              isMultichainOrigin: false,
              optionalScopes: {
                'wallet:eip155': {
                  accounts: [
                    'wallet:eip155:0x1234567890123456789012345678901234567890',
                  ],
                },
              },
              requiredScopes: {},
              sessionProperties: {},
            },
          },
        ],
      },
    });
  });

  it('merges with existing scopes', async () => {
    const hooks = {
      getAllEvmAccounts: jest
        .fn()
        .mockReturnValue(['0x1234567890123456789012345678901234567890']),
      getPermissions: jest.fn().mockReturnValue({
        [SnapEndowments.EthereumProvider]: {},
        'endowment:caip25': {
          caveats: [
            {
              type: 'authorizedScopes',
              value: {
                requiredScopes: {
                  'eip155:1': {
                    accounts: [
                      'eip155:1:0x1234567890123456789012345678901234567890',
                    ],
                  },
                },
                optionalScopes: {
                  'eip155:2': {
                    accounts: [
                      'eip155:2:0x1234567890123456789012345678901234567890',
                    ],
                  },
                },
                sessionProperties: {},
                isMultichainOrigin: false,
              },
            },
          ],
        },
      }),
      grantPermissions: jest.fn(),
    };

    const middleware = createPreinstalledSnapsMiddleware(hooks);

    const engine = new JsonRpcEngine();

    engine.push(middleware);

    const request = {
      jsonrpc: '2.0' as const,
      id: 1,
      method: 'eth_signTypedData_v4',
      params: {},
    };

    // Since we only have one middleware, this will return an error on a successful test.
    expect(await engine.handle(request)).toStrictEqual({
      id: 1,
      jsonrpc: '2.0',
      error: {
        code: -32603,
        data: {
          cause: null,
          request: {
            id: 1,
            jsonrpc: '2.0',
            method: 'eth_signTypedData_v4',
            params: {},
          },
        },
        message: expect.stringContaining(
          'JsonRpcEngine: Response has no error or result for request',
        ),
        stack: expect.stringContaining(
          'JsonRpcEngine: Response has no error or result for request',
        ),
      },
    });

    expect(hooks.grantPermissions).toHaveBeenCalledWith({
      'endowment:caip25': {
        caveats: [
          {
            type: 'authorizedScopes',
            value: {
              requiredScopes: {
                'eip155:1': {
                  accounts: [
                    'eip155:1:0x1234567890123456789012345678901234567890',
                  ],
                },
              },
              optionalScopes: {
                'wallet:eip155': {
                  accounts: [
                    'wallet:eip155:0x1234567890123456789012345678901234567890',
                  ],
                },
                'eip155:2': {
                  accounts: [
                    'eip155:2:0x1234567890123456789012345678901234567890',
                  ],
                },
              },
              isMultichainOrigin: false,
              sessionProperties: {},
            },
          },
        ],
      },
    });
  });

  it('skips the middleware if the accounts are already permitted', async () => {
    const hooks = {
      getAllEvmAccounts: jest
        .fn()
        .mockReturnValue(['0x1234567890123456789012345678901234567890']),
      getPermissions: jest.fn().mockReturnValue({
        [SnapEndowments.EthereumProvider]: {},
        'endowment:caip25': {
          caveats: [
            {
              type: 'authorizedScopes',
              value: {
                requiredScopes: {},
                optionalScopes: {
                  'wallet:eip155': {
                    accounts: [
                      'wallet:eip155:0x1234567890123456789012345678901234567890',
                    ],
                  },
                },
                sessionProperties: {},
                isMultichainOrigin: false,
              },
            },
          ],
        },
      }),
      grantPermissions: jest.fn(),
    };

    const middleware = createPreinstalledSnapsMiddleware(hooks);

    const engine = new JsonRpcEngine();

    engine.push(middleware);

    const request = {
      jsonrpc: '2.0' as const,
      id: 1,
      method: 'eth_signTypedData_v4',
      params: {},
    };

    // Since we only have one middleware, this will return an error on a successful test.
    expect(await engine.handle(request)).toStrictEqual({
      id: 1,
      jsonrpc: '2.0',
      error: {
        code: -32603,
        data: {
          cause: null,
          request: {
            id: 1,
            jsonrpc: '2.0',
            method: 'eth_signTypedData_v4',
            params: {},
          },
        },
        message: expect.stringContaining(
          'JsonRpcEngine: Response has no error or result for request',
        ),
        stack: expect.stringContaining(
          'JsonRpcEngine: Response has no error or result for request',
        ),
      },
    });

    expect(hooks.grantPermissions).not.toHaveBeenCalled();
  });

  it('ignores snap methods', async () => {
    const hooks = {
      getAllEvmAccounts: jest.fn(),
      getPermissions: jest.fn(),
      grantPermissions: jest.fn(),
    };

    const middleware = createPreinstalledSnapsMiddleware(hooks);

    const engine = new JsonRpcEngine();

    engine.push(middleware);

    const request = {
      jsonrpc: '2.0' as const,
      id: 1,
      method: 'snap_dialog',
      params: {},
    };

    // Since we only have one middleware, this will return an error on a successful test.
    expect(await engine.handle(request)).toStrictEqual({
      id: 1,
      jsonrpc: '2.0',
      error: {
        code: -32603,
        data: {
          cause: null,
          request: {
            id: 1,
            jsonrpc: '2.0',
            method: 'snap_dialog',
            params: {},
          },
        },
        message: expect.stringContaining(
          'JsonRpcEngine: Response has no error or result for request',
        ),
        stack: expect.stringContaining(
          'JsonRpcEngine: Response has no error or result for request',
        ),
      },
    });

    expect(hooks.grantPermissions).not.toHaveBeenCalled();
  });

  it('skips the middleware if the Snap doesnt have endowment:ethereum-provider', async () => {
    const hooks = {
      getAllEvmAccounts: jest.fn(),
      getPermissions: jest.fn(),
      grantPermissions: jest.fn(),
    };

    const middleware = createPreinstalledSnapsMiddleware(hooks);

    const engine = new JsonRpcEngine();

    engine.push(middleware);

    const request = {
      jsonrpc: '2.0' as const,
      id: 1,
      method: 'eth_signTypedData_v4',
      params: {},
    };

    // Since we only have one middleware, this will return an error on a successful test.
    expect(await engine.handle(request)).toStrictEqual({
      id: 1,
      jsonrpc: '2.0',
      error: {
        code: -32603,
        data: {
          cause: null,
          request: {
            id: 1,
            jsonrpc: '2.0',
            method: 'eth_signTypedData_v4',
            params: {},
          },
        },
        message: expect.stringContaining(
          'JsonRpcEngine: Response has no error or result for request',
        ),
        stack: expect.stringContaining(
          'JsonRpcEngine: Response has no error or result for request',
        ),
      },
    });

    expect(hooks.grantPermissions).not.toHaveBeenCalled();
  });
});
