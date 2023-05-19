import { JsonRpcEngine } from 'json-rpc-engine';

import { createMiscMethodMiddleware } from './middleware';

describe('createMiscMethodMiddleware', () => {
  it('supports metamask_getProviderState', async () => {
    const engine = new JsonRpcEngine();
    engine.push(createMiscMethodMiddleware());

    const response = await engine.handle({
      jsonrpc: '2.0',
      id: 1,
      method: 'metamask_getProviderState',
      params: [],
    });

    expect(response).toStrictEqual({
      id: 1,
      jsonrpc: '2.0',
      result: {
        accounts: [],
        chainId: '0x01',
        isUnlocked: true,
        networkVersion: '0x01',
      },
    });
  });
});
