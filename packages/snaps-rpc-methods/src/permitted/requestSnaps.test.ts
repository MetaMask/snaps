import { JsonRpcEngine } from '@metamask/json-rpc-engine';
import type {
  RequestedPermissions,
  PermissionConstraint,
  PermissionController,
} from '@metamask/permission-controller';
import type {
  RequestSnapsParams,
  RequestSnapsResult,
} from '@metamask/snaps-sdk';
import { SnapCaveatType } from '@metamask/snaps-utils';
import {
  MOCK_SNAP_ID,
  MOCK_ORIGIN,
  MOCK_LOCAL_SNAP_ID,
  MockControllerMessenger,
  createOriginMiddleware,
  getTruncatedSnap,
} from '@metamask/snaps-utils/test-utils';
import type {
  JsonRpcRequest,
  JsonRpcSuccess,
  PendingJsonRpcResponse,
} from '@metamask/utils';

import type { RequestSnapsMethodActions } from './requestSnaps';
import {
  requestSnapsHandler,
  hasRequestedSnaps,
  getSnapPermissionsRequest,
} from './requestSnaps';
import { WALLET_SNAP_PERMISSION_KEY } from '../restricted/invokeSnap';

describe('requestSnapsHandler', () => {
  it('has the expected shape', () => {
    expect(requestSnapsHandler).toMatchObject({
      implementation: expect.any(Function),
      actionNames: [
        'SnapController:installSnaps',
        'PermissionController:requestPermissions',
        'PermissionController:getPermissions',
      ],
    });
  });
});

describe('hasRequestedSnaps', () => {
  it('returns true if an origin has the requested snaps in its permissions', () => {
    const existingPermission = {
      [WALLET_SNAP_PERMISSION_KEY]: {
        caveats: [
          { type: SnapCaveatType.SnapIds, value: { [MOCK_SNAP_ID]: {} } },
        ],
        date: 1661166080905,
        id: 'VyAsBJiDDKawv_XlNcm13',
        invoker: 'https://metamask.github.io',
        parentCapability: WALLET_SNAP_PERMISSION_KEY,
      },
    } as Record<string, PermissionConstraint>;

    const requestedSnaps = { [MOCK_SNAP_ID]: {} };

    expect(hasRequestedSnaps(existingPermission, requestedSnaps)).toBe(true);
  });

  it('returns false if an origin does not have the requested snaps in its permissions', () => {
    const existingPermission = {
      [WALLET_SNAP_PERMISSION_KEY]: {
        caveats: [{ type: SnapCaveatType.SnapIds, value: { baz: {} } }],
        date: 1661166080905,
        id: 'VyAsBJiDDKawv_XlNcm13',
        invoker: 'https://metamask.github.io',
        parentCapability: WALLET_SNAP_PERMISSION_KEY,
      },
    } as Record<string, PermissionConstraint>;

    const requestedSnaps = { [MOCK_SNAP_ID]: {} };

    expect(hasRequestedSnaps(existingPermission, requestedSnaps)).toBe(false);
  });

  it('returns false if an origin does not have the "wallet_snap" permission', () => {
    const existingPermission = {
      foo: {
        caveats: [{ type: SnapCaveatType.SnapIds, value: { baz: {} } }],
        date: 1661166080905,
        id: 'VyAsBJiDDKawv_XlNcm13',
        invoker: 'https://metamask.github.io',
        parentCapability: WALLET_SNAP_PERMISSION_KEY,
      },
    } as Record<string, PermissionConstraint>;

    const requestedSnaps = { [MOCK_SNAP_ID]: {} };

    expect(hasRequestedSnaps(existingPermission, requestedSnaps)).toBe(false);
  });
});

describe('getSnapPermissionsRequest', () => {
  it('will construct a permission request preserving current snap permissions', () => {
    const requestedPermissions: RequestedPermissions = {
      [WALLET_SNAP_PERMISSION_KEY]: {
        caveats: [
          {
            type: SnapCaveatType.SnapIds,
            value: {
              [`${MOCK_SNAP_ID}1`]: {},
            },
          },
        ],
      },
    };

    const existingPermissions: Record<string, PermissionConstraint> = {
      [WALLET_SNAP_PERMISSION_KEY]: {
        id: '1',
        date: 1,
        caveats: [
          {
            type: SnapCaveatType.SnapIds,
            value: {
              [MOCK_SNAP_ID]: {},
            },
          },
        ],
        parentCapability: WALLET_SNAP_PERMISSION_KEY,
        invoker: MOCK_ORIGIN,
      },
    };

    expect(
      getSnapPermissionsRequest(existingPermissions, requestedPermissions),
    ).toStrictEqual({
      [WALLET_SNAP_PERMISSION_KEY]: {
        caveats: [
          {
            type: SnapCaveatType.SnapIds,
            value: {
              [MOCK_SNAP_ID]: {},
              [`${MOCK_SNAP_ID}1`]: {},
            },
          },
        ],
      },
    });
  });

  it('will return the original requested permissions if the origin has no "wallet_snap" permission', () => {
    const requestedPermissions: RequestedPermissions = {
      [WALLET_SNAP_PERMISSION_KEY]: {
        caveats: [
          {
            type: SnapCaveatType.SnapIds,
            value: {
              [`${MOCK_SNAP_ID}1`]: {},
            },
          },
        ],
      },
    };

    const existingPermissions: Record<string, PermissionConstraint> = {
      foo: {
        id: '1',
        date: 1,
        caveats: null,
        parentCapability: 'foo',
        invoker: MOCK_ORIGIN,
      },
    };

    expect(
      getSnapPermissionsRequest(existingPermissions, requestedPermissions),
    ).toStrictEqual(requestedPermissions);
  });
});

describe('implementation', () => {
  const getMessenger = () => {
    const messenger = new MockControllerMessenger<
      RequestSnapsMethodActions,
      never
    >();

    messenger.registerActionHandler(
      'PermissionController:getPermissions',
      () => ({}),
    );

    messenger.registerActionHandler(
      'PermissionController:requestPermissions',
      async () =>
        [
          {
            [WALLET_SNAP_PERMISSION_KEY]: {
              caveats: [
                {
                  type: SnapCaveatType.SnapIds,
                  value: { [MOCK_SNAP_ID]: { version: '^1.0.0' } },
                },
              ],
              date: 1661166080905,
              id: 'VyAsBJiDDKawv_XlNcm13',
              invoker: 'https://metamask.github.io',
              parentCapability: WALLET_SNAP_PERMISSION_KEY,
            },
          },
          {
            id: 'foo',
            origin: MOCK_ORIGIN,
            data: {
              [WALLET_SNAP_PERMISSION_KEY]: {
                [MOCK_SNAP_ID]: getTruncatedSnap(),
              },
            },
          },
        ] as Awaited<ReturnType<PermissionController['requestPermissions']>>,
    );

    messenger.registerActionHandler(
      'SnapController:installSnaps',
      async () => ({
        [MOCK_SNAP_ID]: getTruncatedSnap(),
      }),
    );

    jest.spyOn(messenger, 'call');

    return messenger;
  };

  it('requests permissions if needed', async () => {
    const { implementation } = requestSnapsHandler;

    const messenger = getMessenger();

    const engine = new JsonRpcEngine();
    engine.push(createOriginMiddleware(MOCK_ORIGIN));
    engine.push((req, res, next, end) => {
      const result = implementation(
        req as JsonRpcRequest<RequestSnapsParams> & { origin: string },
        res as PendingJsonRpcResponse<RequestSnapsResult>,
        next,
        end,
        {} as never,
        messenger,
      );

      result?.catch(end);
    });

    const response = (await engine.handle({
      jsonrpc: '2.0',
      id: 1,
      method: 'wallet_requestSnaps',
      params: {
        [MOCK_SNAP_ID]: { version: '^1.0.0' },
      },
    })) as JsonRpcSuccess<RequestSnapsResult>;

    expect(messenger.call).toHaveBeenCalledWith(
      'PermissionController:requestPermissions',
      { origin: MOCK_ORIGIN },
      {
        [WALLET_SNAP_PERMISSION_KEY]: {
          caveats: [
            {
              type: SnapCaveatType.SnapIds,
              value: { [MOCK_SNAP_ID]: { version: '^1.0.0' } },
            },
          ],
        },
      },
    );

    expect(response.result).toStrictEqual({
      [MOCK_SNAP_ID]: getTruncatedSnap(),
    });
  });

  it('does not request permissions if already present', async () => {
    const { implementation } = requestSnapsHandler;

    const messenger = getMessenger();

    messenger.registerActionHandler(
      'PermissionController:getPermissions',
      () => ({
        [WALLET_SNAP_PERMISSION_KEY]: {
          caveats: [
            {
              type: SnapCaveatType.SnapIds,
              value: { [MOCK_SNAP_ID]: { version: '^1.0.0' } },
            },
          ],
          date: 1661166080905,
          id: 'VyAsBJiDDKawv_XlNcm13',
          invoker: 'https://metamask.github.io',
          parentCapability: WALLET_SNAP_PERMISSION_KEY,
        },
      }),
    );

    const engine = new JsonRpcEngine();
    engine.push(createOriginMiddleware(MOCK_ORIGIN));
    engine.push((req, res, next, end) => {
      const result = implementation(
        req as JsonRpcRequest<RequestSnapsParams> & { origin: string },
        res as PendingJsonRpcResponse<RequestSnapsResult>,
        next,
        end,
        {} as never,
        messenger,
      );

      result?.catch(end);
    });

    const response = (await engine.handle({
      jsonrpc: '2.0',
      id: 1,
      method: 'wallet_requestSnaps',
      params: {
        [MOCK_SNAP_ID]: { version: '^1.0.0' },
      },
    })) as JsonRpcSuccess<RequestSnapsResult>;

    expect(messenger.call).not.toHaveBeenCalledWith(
      'PermissionController:requestPermissions',
      expect.anything(),
      expect.anything(),
    );

    expect(messenger.call).toHaveBeenCalledWith(
      'SnapController:installSnaps',
      MOCK_ORIGIN,
      {
        [MOCK_SNAP_ID]: { version: '^1.0.0' },
      },
    );

    expect(response.result).toStrictEqual({
      [MOCK_SNAP_ID]: getTruncatedSnap(),
    });
  });

  it('merges permission requests when missing snaps', async () => {
    const { implementation } = requestSnapsHandler;

    const messenger = getMessenger();

    messenger.registerActionHandler(
      'PermissionController:getPermissions',
      () => ({
        [WALLET_SNAP_PERMISSION_KEY]: {
          caveats: [
            {
              type: SnapCaveatType.SnapIds,
              value: { [MOCK_SNAP_ID]: { version: '^1.0.0' } },
            },
          ],
          date: 1661166080905,
          id: 'VyAsBJiDDKawv_XlNcm13',
          invoker: 'https://metamask.github.io',
          parentCapability: WALLET_SNAP_PERMISSION_KEY,
        },
      }),
    );

    messenger.registerActionHandler(
      'PermissionController:requestPermissions',
      async () =>
        [
          {
            [WALLET_SNAP_PERMISSION_KEY]: {
              caveats: [
                {
                  type: SnapCaveatType.SnapIds,
                  value: {
                    [MOCK_SNAP_ID]: { version: '^1.0.0' },
                    [MOCK_LOCAL_SNAP_ID]: { version: '^1.0.0' },
                  },
                },
              ],
              date: 1661166080905,
              id: 'VyAsBJiDDKawv_XlNcm13',
              invoker: 'https://metamask.github.io',
              parentCapability: WALLET_SNAP_PERMISSION_KEY,
            },
          },
          {
            id: 'foo',
            origin: MOCK_ORIGIN,
            data: {
              [WALLET_SNAP_PERMISSION_KEY]: {
                [MOCK_SNAP_ID]: getTruncatedSnap(),
                [MOCK_LOCAL_SNAP_ID]: getTruncatedSnap({
                  id: MOCK_LOCAL_SNAP_ID,
                }),
              },
            },
          },
        ] as Awaited<ReturnType<PermissionController['requestPermissions']>>,
    );

    const engine = new JsonRpcEngine();
    engine.push(createOriginMiddleware(MOCK_ORIGIN));
    engine.push((req, res, next, end) => {
      const result = implementation(
        req as JsonRpcRequest<RequestSnapsParams> & { origin: string },
        res as PendingJsonRpcResponse<RequestSnapsResult>,
        next,
        end,
        {} as never,
        messenger,
      );

      result?.catch(end);
    });

    const response = (await engine.handle({
      jsonrpc: '2.0',
      id: 1,
      method: 'wallet_requestSnaps',
      params: {
        [MOCK_SNAP_ID]: { version: '^1.0.0' },
        [MOCK_LOCAL_SNAP_ID]: { version: '^1.0.0' },
      },
    })) as JsonRpcSuccess<RequestSnapsResult>;

    expect(messenger.call).toHaveBeenCalledWith(
      'PermissionController:requestPermissions',
      { origin: MOCK_ORIGIN },
      {
        [WALLET_SNAP_PERMISSION_KEY]: {
          caveats: [
            {
              type: SnapCaveatType.SnapIds,
              value: {
                [MOCK_SNAP_ID]: { version: '^1.0.0' },
                [MOCK_LOCAL_SNAP_ID]: { version: '^1.0.0' },
              },
            },
          ],
        },
      },
    );

    expect(response.result).toStrictEqual({
      [MOCK_SNAP_ID]: getTruncatedSnap(),
      [MOCK_LOCAL_SNAP_ID]: getTruncatedSnap({ id: MOCK_LOCAL_SNAP_ID }),
    });
  });

  it('throws with the appropriate error if the side-effect fails', async () => {
    const { implementation } = requestSnapsHandler;

    const messenger = getMessenger();

    messenger.registerActionHandler(
      'PermissionController:requestPermissions',
      async () => {
        throw new Error('error');
      },
    );

    const engine = new JsonRpcEngine();
    engine.push(createOriginMiddleware(MOCK_ORIGIN));
    engine.push((req, res, next, end) => {
      const result = implementation(
        req as JsonRpcRequest<RequestSnapsParams> & { origin: string },
        res as PendingJsonRpcResponse<RequestSnapsResult>,
        next,
        end,
        {} as never,
        messenger,
      );

      result?.catch(end);
    });

    const response = (await engine.handle({
      jsonrpc: '2.0',
      id: 1,
      method: 'wallet_requestSnaps',
      params: {
        [MOCK_SNAP_ID]: { version: '^1.0.0' },
      },
    })) as JsonRpcSuccess<RequestSnapsResult>;

    expect(messenger.call).toHaveBeenCalledWith(
      'PermissionController:requestPermissions',
      { origin: MOCK_ORIGIN },
      {
        [WALLET_SNAP_PERMISSION_KEY]: {
          caveats: [
            {
              type: SnapCaveatType.SnapIds,
              value: { [MOCK_SNAP_ID]: { version: '^1.0.0' } },
            },
          ],
        },
      },
    );

    expect(response).toStrictEqual({
      error: {
        code: -32603,
        data: { cause: expect.objectContaining({ message: 'error' }) },
        message: 'error',
      },
      id: 1,
      jsonrpc: '2.0',
    });
  });

  it('throws if params is not an object', async () => {
    const { implementation } = requestSnapsHandler;

    const messenger = getMessenger();

    const engine = new JsonRpcEngine();
    engine.push(createOriginMiddleware(MOCK_ORIGIN));
    engine.push((req, res, next, end) => {
      const result = implementation(
        req as JsonRpcRequest<RequestSnapsParams> & { origin: string },
        res as PendingJsonRpcResponse<RequestSnapsResult>,
        next,
        end,
        {} as never,
        messenger,
      );

      result?.catch(end);
    });

    const response = (await engine.handle({
      jsonrpc: '2.0',
      id: 1,
      method: 'wallet_requestSnaps',
      params: [],
    })) as JsonRpcSuccess<RequestSnapsResult>;

    expect(response).toStrictEqual({
      error: {
        code: -32602,
        message: '"params" must be an object.',
        stack: expect.any(String),
      },
      id: 1,
      jsonrpc: '2.0',
    });
  });

  it('throws if params is an empty object', async () => {
    const { implementation } = requestSnapsHandler;

    const messenger = getMessenger();

    const engine = new JsonRpcEngine();
    engine.push(createOriginMiddleware(MOCK_ORIGIN));
    engine.push((req, res, next, end) => {
      const result = implementation(
        req as JsonRpcRequest<RequestSnapsParams> & { origin: string },
        res as PendingJsonRpcResponse<RequestSnapsResult>,
        next,
        end,
        {} as never,
        messenger,
      );

      result?.catch(end);
    });

    const response = (await engine.handle({
      jsonrpc: '2.0',
      id: 1,
      method: 'wallet_requestSnaps',
      params: {},
    })) as JsonRpcSuccess<RequestSnapsResult>;

    expect(response).toStrictEqual({
      error: {
        code: -32602,
        message: 'Request must have at least one requested snap.',
        stack: expect.any(String),
      },
      id: 1,
      jsonrpc: '2.0',
    });
  });
});
