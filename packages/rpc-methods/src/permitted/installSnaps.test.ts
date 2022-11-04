import {
  MOCK_SNAP_ID,
  getTruncatedSnap,
} from '@metamask/snap-utils/test-utils';
import { getSnapPermissionName } from '@metamask/snap-utils';
import { JsonRpcEngine } from 'json-rpc-engine';
import { installSnapsHandler } from './installSnaps';

describe('installSnapsHandler', () => {
  it('has the expected shape', () => {
    expect(installSnapsHandler).toMatchObject({
      methodNames: ['wallet_installSnaps'],
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
    const { implementation } = installSnapsHandler;

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
      implementation(req as any, res as any, next, end, hooks),
    );

    const response: any = await engine.handle({
      jsonrpc: '2.0',
      id: 1,
      method: 'wallet_installSnaps',
      params: {
        [MOCK_SNAP_ID]: {},
      },
    });

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
    const { implementation } = installSnapsHandler;

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
      implementation(req as any, res as any, next, end, hooks),
    );

    const response: any = await engine.handle({
      jsonrpc: '2.0',
      id: 1,
      method: 'wallet_installSnaps',
      params: {
        [MOCK_SNAP_ID]: {},
      },
    });

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
