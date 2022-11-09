import {
  MOCK_SNAP_ID,
  getTruncatedSnap,
} from '@metamask/snaps-utils/test-utils';
import {
  JsonRpcRequest,
  JsonRpcSuccess,
  PendingJsonRpcResponse,
} from '@metamask/types';
import {
  getSnapPermissionName,
  InstallSnapsResult,
} from '@metamask/snaps-utils';
import { JsonRpcEngine } from 'json-rpc-engine';
import { RequestedPermissions } from '@metamask/controllers';
import { requestSnapsHandler } from './requestSnaps';

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
        caveats: null,
        date: 1661166080905,
        id: 'VyAsBJiDDKawv_XlNcm13',
        invoker: 'https://metamask.github.io',
        parentCapability: getSnapPermissionName(MOCK_SNAP_ID),
      },
    ]);

    hooks.installSnaps.mockImplementation(() => ({
      [MOCK_SNAP_ID]: getTruncatedSnap(),
    }));

    const engine = new JsonRpcEngine();
    engine.push((req, res, next, end) =>
      implementation(
        req as JsonRpcRequest<RequestedPermissions>,
        res as PendingJsonRpcResponse<InstallSnapsResult>,
        next,
        end,
        hooks,
      ),
    );

    const response = (await engine.handle({
      jsonrpc: '2.0',
      id: 1,
      method: 'wallet_installSnaps',
      params: {
        [MOCK_SNAP_ID]: {},
      },
    })) as JsonRpcSuccess<InstallSnapsResult>;

    expect(hooks.requestPermissions).toHaveBeenCalledWith({
      [getSnapPermissionName(MOCK_SNAP_ID)]: {},
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
      [getSnapPermissionName(MOCK_SNAP_ID)]: {
        caveats: null,
        date: 1661166080905,
        id: 'VyAsBJiDDKawv_XlNcm13',
        invoker: 'https://metamask.github.io',
        parentCapability: getSnapPermissionName(MOCK_SNAP_ID),
      },
    }));

    hooks.installSnaps.mockImplementation(() => ({
      [MOCK_SNAP_ID]: getTruncatedSnap(),
    }));

    const engine = new JsonRpcEngine();
    engine.push((req, res, next, end) =>
      implementation(
        req as JsonRpcRequest<RequestedPermissions>,
        res as PendingJsonRpcResponse<InstallSnapsResult>,
        next,
        end,
        hooks,
      ),
    );

    const response = (await engine.handle({
      jsonrpc: '2.0',
      id: 1,
      method: 'wallet_installSnaps',
      params: {
        [MOCK_SNAP_ID]: {},
      },
    })) as JsonRpcSuccess<InstallSnapsResult>;

    expect(hooks.requestPermissions).not.toHaveBeenCalledWith({
      [getSnapPermissionName(MOCK_SNAP_ID)]: {},
    });

    expect(hooks.installSnaps).toHaveBeenCalledWith({
      [MOCK_SNAP_ID]: {},
    });

    expect(response.result).toStrictEqual({
      [MOCK_SNAP_ID]: getTruncatedSnap(),
    });
  });
});
