import { JsonRpcEngineV2 } from '@metamask/json-rpc-engine/v2';
import type { JsonRpcRequest } from '@metamask/utils';

import { createWalletSnapPermissionMiddleware } from '@metamask/snaps-rpc-methods';

describe('createWalletSnapPermissionMiddleware', () => {
  it('throws an error if wallet_snap permission is requested with other permissions', async () => {
    const engine = JsonRpcEngineV2.create({
      middleware: [createWalletSnapPermissionMiddleware()],
    });

    const request = {
      jsonrpc: '2.0' as const,
      id: 1,
      method: 'wallet_requestPermissions',
      params: [
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          wallet_snap: {},
          some_other_permission: {},
          /* eslint-enable @typescript-eslint/naming-convention */
        },
      ] as const,
    } satisfies JsonRpcRequest;

    await expect(engine.handle(request)).rejects.toThrow(
      'Permission request for `wallet_snap` cannot include other permissions. Please separate your permission requests into multiple calls to `wallet_requestPermissions`.',
    );
  });

  it('allows permission requests that do not include wallet_snap', async () => {
    const responseMiddleware = jest.fn().mockReturnValue(true);

    const engine = JsonRpcEngineV2.create({
      middleware: [createWalletSnapPermissionMiddleware(), responseMiddleware],
    });

    const request = {
      jsonrpc: '2.0' as const,
      id: 1,
      method: 'wallet_requestPermissions',
      params: [
        {
          /* eslint-disable @typescript-eslint/naming-convention */
          some_permission: {},
          some_other_permission: {},
          /* eslint-enable @typescript-eslint/naming-convention */
        },
      ] as const,
    } satisfies JsonRpcRequest;

    expect(await engine.handle(request)).toBe(true);
  });
});
