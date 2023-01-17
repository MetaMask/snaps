import { PermissionType } from '@metamask/permission-controller';
import { SnapCaveatType } from '@metamask/snaps-utils';
import {
  MOCK_SNAP_ID,
  MOCK_ORIGIN,
  getTruncatedSnap,
} from '@metamask/snaps-utils/test-utils';

import { invokeSnapBuilder, getInvokeSnapImplementation } from './invokeSnap';

describe('builder', () => {
  it('has the expected shape', () => {
    expect(invokeSnapBuilder).toMatchObject({
      targetKey: 'wallet_snap',
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
      targetKey: 'wallet_snap',
      allowedCaveats: [SnapCaveatType.SnapIds],
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
      method: 'wallet_snap',
      params: {
        snapId: MOCK_SNAP_ID,
        request: { method: 'hello', params: {} },
      },
    });

    expect(hooks.getSnap).toHaveBeenCalledTimes(1);
    expect(hooks.getSnap).toHaveBeenCalledWith(MOCK_SNAP_ID);
    expect(hooks.handleSnapRpcRequest).toHaveBeenCalledWith({
      handler: 'onRpcRequest',
      origin: MOCK_ORIGIN,
      request: {
        jsonrpc: '2.0',
        id: expect.any(String),
        method: 'hello',
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
        method: 'wallet_snap',
        params: {
          snapId: MOCK_SNAP_ID,
          request: { method: 'hello', params: {} },
        },
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
        method: 'wallet_snap',
        params: {},
      }),
    ).rejects.toThrow(
      'Must specify a valid JSON-RPC request object as single parameter.',
    );

    expect(hooks.getSnap).toHaveBeenCalledTimes(0);
    expect(hooks.handleSnapRpcRequest).not.toHaveBeenCalled();
  });
});
