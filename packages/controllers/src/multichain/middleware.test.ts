import { JsonRpcEngine } from 'json-rpc-engine';
import { createMultiChainMiddleware } from './middleware';

describe('createMultiChainMiddleware', () => {
  it('supports metamask_handshake', async () => {
    const onRequest = jest.fn();
    const onConnect = jest.fn().mockResolvedValue('foo bar');
    const middleware = createMultiChainMiddleware({ onConnect, onRequest });

    const engine = new JsonRpcEngine();

    engine.push(middleware);

    const request = {
      jsonrpc: '2.0' as const,
      id: 1,
      method: 'wallet_multiChainRequestHack',
      params: {
        method: 'metamask_handshake',
        params: { requiredNamespaces: {} },
      },
    };

    expect(await engine.handle(request)).toStrictEqual({
      id: 1,
      jsonrpc: '2.0',
      result: 'foo bar',
    });
  });

  it('supports caip_request', async () => {
    const onRequest = jest.fn().mockResolvedValue('foo bar');
    const onConnect = jest.fn();
    const middleware = createMultiChainMiddleware({ onConnect, onRequest });
    const engine = new JsonRpcEngine();

    engine.push(middleware);

    const request = {
      jsonrpc: '2.0' as const,
      id: 1,
      method: 'wallet_multiChainRequestHack',
      params: {
        method: 'caip_request',
        params: { chainId: 'eip155:966', request: { method: 'eth_accounts' } },
      },
    };

    expect(await engine.handle(request)).toStrictEqual({
      id: 1,
      jsonrpc: '2.0',
      result: 'foo bar',
    });
  });

  it('skips request if method doesnt match', () => {
    const onRequest = jest.fn();
    const onConnect = jest.fn();
    const middleware = createMultiChainMiddleware({ onConnect, onRequest });

    const next = jest.fn();
    const end = jest.fn();
    const req = {
      jsonrpc: '2.0' as const,
      id: 1,
      method: 'metamask_handshake',
      // Type is not valid
      params: {} as any,
    };
    const res = { jsonrpc: '2.0' as const, id: 1 };
    const originalRes = { ...res };

    middleware(req, res, next, end);
    expect(next).toHaveBeenCalled();
    expect(res).toStrictEqual(originalRes);
  });

  it('skips request if unwrapped method doesnt match', () => {
    const onRequest = jest.fn();
    const onConnect = jest.fn();
    const middleware = createMultiChainMiddleware({ onConnect, onRequest });

    const next = jest.fn();
    const end = jest.fn();
    const req = {
      jsonrpc: '2.0' as const,
      id: 1,
      method: 'wallet_multiChainRequestHack',
      params: {
        method: 'baz',
        params: {},
      },
    };
    const res = { jsonrpc: '2.0' as const, id: 1 };

    middleware(req, res, next, end);
    expect(next).toHaveBeenCalled();
  });
});
