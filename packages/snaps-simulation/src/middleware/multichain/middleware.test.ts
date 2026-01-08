import { JsonRpcEngine } from '@metamask/json-rpc-engine';
import { mnemonicPhraseToBytes } from '@metamask/key-tree';

import { createMultichainMiddleware } from './middleware';
import { DEFAULT_SRP } from '../../constants';

/**
 * Sets up the JSON-RPC engine and middleware for testing.
 *
 * @param isMultichain - Whether to enable the multichain API or not.
 * @returns The JSON-RPC engine.
 */
function createMiddleware(isMultichain: boolean = true) {
  const hooks = {
    getMnemonic: jest
      .fn()
      .mockResolvedValue(mnemonicPhraseToBytes(DEFAULT_SRP)),
    getCaveat: jest.fn(),
    grantPermissions: jest.fn(),
  };
  const middleware = createMultichainMiddleware(isMultichain, hooks);
  const engine = new JsonRpcEngine();
  engine.push(middleware);
  return { engine, hooks };
}

describe('Multichain Middleware', () => {
  it('routes requests to multichain handlers', async () => {
    const { engine } = createMiddleware();
    const result = await engine.handle({
      jsonrpc: '2.0',
      id: 1,
      method: 'wallet_getSession',
    });

    expect(result).toStrictEqual(
      expect.objectContaining({ result: { sessionScopes: {} } }),
    );
  });

  it('throws when receiving non-multichain requests', async () => {
    const { engine } = createMiddleware();
    const result = await engine.handle({
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_call',
    });

    expect(result).toStrictEqual(
      expect.objectContaining({
        error: {
          code: -32601,
          message: 'The method does not exist / is not available.',
          stack: expect.any(String),
        },
      }),
    );
  });

  it('throws when receiving multichain requests while multichain is disabled', async () => {
    const { engine } = createMiddleware(false);
    const result = await engine.handle({
      jsonrpc: '2.0',
      id: 1,
      method: 'wallet_getSession',
    });

    expect(result).toStrictEqual(
      expect.objectContaining({
        error: {
          code: -32601,
          message: 'The method does not exist / is not available.',
          stack: expect.any(String),
        },
      }),
    );
  });

  it('passes non-multichain requests to the next middleware', async () => {
    const { engine } = createMiddleware(false);
    const result = await engine.handle({
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_call',
    });

    expect(result).toStrictEqual(
      expect.objectContaining({
        error: expect.objectContaining({
          message: expect.stringContaining(
            'JsonRpcEngine: Response has no error or result for request:',
          ),
          stack: expect.any(String),
        }),
      }),
    );
  });
});
