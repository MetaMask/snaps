import {
  RequestedPermissions,
  PermissionConstraint,
} from '@metamask/permission-controller';
import { InstallSnapsResult, SnapCaveatType } from '@metamask/snaps-utils';
import {
  MOCK_SNAP_ID,
  getTruncatedSnap,
} from '@metamask/snaps-utils/test-utils';
import {
  JsonRpcRequest,
  JsonRpcSuccess,
  PendingJsonRpcResponse,
} from '@metamask/types';
import { JsonRpcEngine } from 'json-rpc-engine';

import { targetKey as permissionName } from '../restricted/invokeSnap';
import { requestSnapsHandler, hasSnaps } from './requestSnaps';

describe('requestSnapsHandler', () => {
  it('has the expected shape', () => {
    expect(requestSnapsHandler).toMatchObject({
      methodNames: ['wallet_requestSnaps'],
      implementation: expect.any(Function),
      hookNames: {
        installSnaps: true,
        requestPermissions: true,
        getPermissions: true,
      },
    });
  });
});

describe('hasSnaps', () => {
  it('returns true if an origin has the requested snaps in its permissions', () => {
    const existingPermission = {
      [permissionName]: {
        caveats: [
          { type: SnapCaveatType.SnapIds, value: { [MOCK_SNAP_ID]: {} } },
        ],
        date: 1661166080905,
        id: 'VyAsBJiDDKawv_XlNcm13',
        invoker: 'https://metamask.github.io',
        parentCapability: permissionName,
      },
    } as Record<string, PermissionConstraint>;

    const requestedSnaps = { [MOCK_SNAP_ID]: {} };

    expect(hasSnaps(existingPermission, requestedSnaps)).toBe(true);
  });

  it('returns false if an origin does not have the requested snaps in its permissions', () => {
    const existingPermission = {
      [permissionName]: {
        caveats: [{ type: SnapCaveatType.SnapIds, value: { baz: {} } }],
        date: 1661166080905,
        id: 'VyAsBJiDDKawv_XlNcm13',
        invoker: 'https://metamask.github.io',
        parentCapability: permissionName,
      },
    } as Record<string, PermissionConstraint>;

    const requestedSnaps = { [MOCK_SNAP_ID]: {} };

    expect(hasSnaps(existingPermission, requestedSnaps)).toBe(false);
  });

  it('returns false if an origin does not have the "wallet_snap" permission', () => {
    const existingPermission = {
      foo: {
        caveats: [{ type: SnapCaveatType.SnapIds, value: { baz: {} } }],
        date: 1661166080905,
        id: 'VyAsBJiDDKawv_XlNcm13',
        invoker: 'https://metamask.github.io',
        parentCapability: permissionName,
      },
    } as Record<string, PermissionConstraint>;

    const requestedSnaps = { [MOCK_SNAP_ID]: {} };

    expect(hasSnaps(existingPermission, requestedSnaps)).toBe(false);
  });
});

describe('implementation', () => {
  const getMockHooks = () =>
    ({
      installSnaps: jest.fn(),
      requestPermissions: jest.fn(),
      getPermissions: jest.fn(),
    } as any);

  it('requests permissions if needed', async () => {
    const { implementation } = requestSnapsHandler;

    const hooks = getMockHooks();

    hooks.requestPermissions.mockImplementation(() => [
      {
        caveats: [
          { type: SnapCaveatType.SnapIds, value: { [MOCK_SNAP_ID]: {} } },
        ],
        date: 1661166080905,
        id: 'VyAsBJiDDKawv_XlNcm13',
        invoker: 'https://metamask.github.io',
        parentCapability: permissionName,
      },
    ]);

    hooks.installSnaps.mockImplementation(() => ({
      [MOCK_SNAP_ID]: getTruncatedSnap(),
    }));

    const engine = new JsonRpcEngine();
    engine.push((req, res, next, end) => {
      const result = implementation(
        req as JsonRpcRequest<RequestedPermissions>,
        res as PendingJsonRpcResponse<InstallSnapsResult>,
        next,
        end,
        hooks,
      );

      result?.catch(end);
    });

    const response = (await engine.handle({
      jsonrpc: '2.0',
      id: 1,
      method: 'wallet_requestSnaps',
      params: {
        [MOCK_SNAP_ID]: {},
      },
    })) as JsonRpcSuccess<InstallSnapsResult>;

    expect(hooks.requestPermissions).toHaveBeenCalledWith({
      [permissionName]: {
        caveats: [
          { type: SnapCaveatType.SnapIds, value: { [MOCK_SNAP_ID]: {} } },
        ],
      },
    });

    expect(hooks.installSnaps).toHaveBeenCalledWith({
      [MOCK_SNAP_ID]: {},
    });

    expect(response.result).toStrictEqual({
      [MOCK_SNAP_ID]: getTruncatedSnap(),
    });
  });

  it('doesnt request permissions if already present', async () => {
    const { implementation } = requestSnapsHandler;

    const hooks = getMockHooks();

    hooks.getPermissions.mockImplementation(() => ({
      [permissionName]: {
        caveats: [
          { type: SnapCaveatType.SnapIds, value: { [MOCK_SNAP_ID]: {} } },
        ],
        date: 1661166080905,
        id: 'VyAsBJiDDKawv_XlNcm13',
        invoker: 'https://metamask.github.io',
        parentCapability: permissionName,
      },
    }));

    hooks.installSnaps.mockImplementation(() => ({
      [MOCK_SNAP_ID]: getTruncatedSnap(),
    }));

    const engine = new JsonRpcEngine();
    engine.push((req, res, next, end) => {
      const result = implementation(
        req as JsonRpcRequest<RequestedPermissions>,
        res as PendingJsonRpcResponse<InstallSnapsResult>,
        next,
        end,
        hooks,
      );

      result?.catch(end);
    });

    const response = (await engine.handle({
      jsonrpc: '2.0',
      id: 1,
      method: 'wallet_requestSnaps',
      params: {
        [MOCK_SNAP_ID]: {},
      },
    })) as JsonRpcSuccess<InstallSnapsResult>;

    expect(hooks.requestPermissions).not.toHaveBeenCalledWith({
      [permissionName]: {
        caveats: [
          { type: SnapCaveatType.SnapIds, value: { [MOCK_SNAP_ID]: {} } },
        ],
      },
    });

    expect(hooks.installSnaps).toHaveBeenCalledWith({
      [MOCK_SNAP_ID]: {},
    });

    expect(response.result).toStrictEqual({
      [MOCK_SNAP_ID]: getTruncatedSnap(),
    });
  });
});
