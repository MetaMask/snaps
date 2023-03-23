import { PermissionType } from '@metamask/permission-controller';
import { SnapCaveatType } from '@metamask/snaps-utils';
import {
  MOCK_SNAP_ID,
  MOCK_ORIGIN,
  getTruncatedSnap,
} from '@metamask/snaps-utils/test-utils';

import {
  invokeSnapBuilder,
  getInvokeSnapImplementation,
  WALLET_SNAP_PERMISSION_KEY,
} from './invokeSnap';

describe('builder', () => {
  it('has the expected shape', () => {
    expect(invokeSnapBuilder).toMatchObject({
      targetKey: WALLET_SNAP_PERMISSION_KEY,
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
      targetKey: WALLET_SNAP_PERMISSION_KEY,
      allowedCaveats: [SnapCaveatType.SnapIds],
      methodImplementation: expect.any(Function),
    });
  });
});

describe('specificationBuilder', () => {
  const specification = invokeSnapBuilder.specificationBuilder({
    methodHooks: {
      getSnap: jest.fn(),
      handleSnapRpcRequest: jest.fn(),
    },
  });
  describe('validator', () => {
    it('throws if the caveat is not a single "snapIds"', () => {
      expect(() =>
        // @ts-expect-error Missing required permission types.
        specification.validator({}),
      ).toThrow('Expected a single "snapIds" caveat.');

      expect(() =>
        // @ts-expect-error Missing required permission types.
        specification.validator({ caveats: [{ type: 'foo', value: 'bar' }] }),
      ).toThrow('Expected a single "snapIds" caveat.');

      expect(() =>
        // @ts-expect-error Missing required permission types.
        specification.validator({
          caveats: [
            { type: SnapCaveatType.SnapIds, value: { [MOCK_SNAP_ID]: {} } },
            { type: SnapCaveatType.SnapIds, value: { [MOCK_SNAP_ID]: {} } },
          ],
        }),
      ).toThrow('Expected a single "snapIds" caveat.');
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
      method: WALLET_SNAP_PERMISSION_KEY,
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
        method: WALLET_SNAP_PERMISSION_KEY,
        params: {
          snapId: MOCK_SNAP_ID,
          request: { method: 'hello', params: {} },
        },
      }),
    ).rejects.toThrow(
      `The snap "${MOCK_SNAP_ID}" is not installed. Please install it first, before invoking the snap.`,
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
        method: WALLET_SNAP_PERMISSION_KEY,
        params: {},
      }),
    ).rejects.toThrow(
      'Must specify a valid JSON-RPC request object as single parameter.',
    );

    expect(hooks.getSnap).toHaveBeenCalledTimes(0);
    expect(hooks.handleSnapRpcRequest).not.toHaveBeenCalled();
  });
});
