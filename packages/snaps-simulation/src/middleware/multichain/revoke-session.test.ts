import { Caip25EndowmentPermissionName } from '@metamask/chain-agnostic-permission';

import { revokeSessionHandler } from './revoke-session';

describe('revokeSessionHandler', () => {
  it('revokes the permission and returns true', () => {
    const revokePermission = jest.fn();

    const result = revokeSessionHandler(
      {
        jsonrpc: '2.0',
        id: 1,
        method: 'wallet_getSession',
        params: {},
      },
      { revokePermission },
    );

    expect(result).toBe(true);
    expect(revokePermission).toHaveBeenCalledWith(
      Caip25EndowmentPermissionName,
    );
  });
});
