import { PermissionType } from '@metamask/controllers';
import {
  MOCK_SNAP_ID,
  MOCK_ORIGIN,
  getTruncatedSnap,
} from '@metamask/snap-utils/test-utils';
import { invokeSnapBuilder, getInvokeSnapImplementation } from './invokeSnap';

describe('builder', () => {
  it('has the expected shape', () => {
    expect(invokeSnapBuilder).toMatchObject({
      targetKey: 'wallet_snap_*',
      specificationBuilder: expect.any(Function),
      methodHooks: {
        getSnap: true,
        handleSnapRpcRequest: true,
      },
    });
  });

  it('builder outputs expected specification', () => {
    expect(
      invokeSnapBuilder.specificationBuilder({
        methodHooks: {
          getSnap: jest.fn(),
          handleSnapRpcRequest: jest.fn(),
        },
      }),
    ).toMatchObject({
      permissionType: PermissionType.RestrictedMethod,
      targetKey: 'wallet_snap_*',
      allowedCaveats: null,
      methodImplementation: expect.any(Function),
    });
  });
});

describe('implementation', () => {
  const getMockHooks = () =>
    ({
      getSnap: jest.fn(),
      handleSnapRpcRequest: jest.fn(),
    } as any);
  it('calls handleSnapRpcRequest', async () => {
    const hooks = getMockHooks();
    hooks.getSnap.mockImplementation(getTruncatedSnap);
    const implementation = getInvokeSnapImplementation(hooks);
    await implementation({
      context: { origin: MOCK_ORIGIN },
      method: `wallet_snap_${MOCK_SNAP_ID}`,
      params: [{ method: 'foo', params: {} }],
    });

    expect(hooks.getSnap).toHaveBeenCalledTimes(1);
    expect(hooks.getSnap).toHaveBeenCalledWith(MOCK_SNAP_ID);
    expect(hooks.handleSnapRpcRequest).toHaveBeenCalledWith({
      handler: 'onRpcRequest',
      origin: MOCK_ORIGIN,
      request: {
        jsonrpc: '2.0',
        id: expect.any(String),
        method: 'foo',
        params: {},
      },
      snapId: MOCK_SNAP_ID,
    });
  });

  it('throws if snap is not installed', async () => {
    const hooks = getMockHooks();
    const implementation = getInvokeSnapImplementation(hooks);
    await expect(
      implementation({
        context: { origin: MOCK_ORIGIN },
        method: `wallet_snap_${MOCK_SNAP_ID}`,
        params: [{ method: 'foo', params: {} }],
      }),
    ).rejects.toThrow(
      `The snap "${MOCK_SNAP_ID}" is not installed. This is a bug, please report it.`,
    );
    expect(hooks.getSnap).toHaveBeenCalledTimes(1);
    expect(hooks.getSnap).toHaveBeenCalledWith(MOCK_SNAP_ID);

    expect(hooks.handleSnapRpcRequest).not.toHaveBeenCalled();
  });

  it('throws if request is not valid', async () => {
    const hooks = getMockHooks();
    hooks.getSnap.mockImplementation(getTruncatedSnap);
    const implementation = getInvokeSnapImplementation(hooks);
    await expect(
      implementation({
        context: { origin: MOCK_ORIGIN },
        method: `wallet_snap_${MOCK_SNAP_ID}`,
        params: [{}],
      }),
    ).rejects.toThrow(
      'Must specify a valid JSON-RPC request object as single parameter.',
    );

    expect(hooks.getSnap).toHaveBeenCalledTimes(0);
    expect(hooks.handleSnapRpcRequest).not.toHaveBeenCalled();
  });
});
