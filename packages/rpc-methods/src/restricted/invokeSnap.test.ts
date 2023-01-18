import { PermissionType, Caveat } from '@metamask/permission-controller';
import { SnapCaveatType } from '@metamask/snaps-utils';
import {
  MOCK_SNAP_ID,
  MOCK_ORIGIN,
  getTruncatedSnap,
} from '@metamask/snaps-utils/test-utils';
import { Json } from '@metamask/utils';

import {
  invokeSnapBuilder,
  getInvokeSnapImplementation,
  validateCaveat,
  getInvokeSnapCaveatSpecifications,
} from './invokeSnap';

const restrictedMethod = 'wallet_snap';

describe('builder', () => {
  it('has the expected shape', () => {
    expect(invokeSnapBuilder).toMatchObject({
      targetKey: restrictedMethod,
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
      targetKey: restrictedMethod,
      allowedCaveats: [SnapCaveatType.SnapIds],
      methodImplementation: expect.any(Function),
    });
  });
});

describe('validateCaveats', () => {
  it('validates that a caveat has a non-empty object as a caveat value', () => {
    const caveat = {
      type: SnapCaveatType.SnapIds,
      value: { [MOCK_SNAP_ID]: {} },
    };
    const missingValueCaveat = {
      type: SnapCaveatType.SnapIds,
    };
    const emptyValueCaveat = {
      type: SnapCaveatType.SnapIds,
      value: {},
    };
    expect(() => validateCaveat(caveat)).not.toThrow();
    expect(() =>
      validateCaveat(missingValueCaveat as Caveat<string, Json>),
    ).toThrow(
      'Expected caveat to have a value property of a non-empty object of snap ids.',
    );
    expect(() => validateCaveat(emptyValueCaveat)).toThrow(
      'Expected caveat to have a value property of a non-empty object of snap ids.',
    );
  });
});

describe('getInvokeSnapCaveatSpecifications', () => {
  describe('validator', () => {
    it('throws for an invalid caveat object', () => {
      expect(() => {
        getInvokeSnapCaveatSpecifications[SnapCaveatType.SnapIds].validator?.({
          type: SnapCaveatType.SnapIds,
          value: {},
        });
      }).toThrow(
        'Expected caveat to have a value property of a non-empty object of snap ids.',
      );
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
      method: restrictedMethod,
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
        method: restrictedMethod,
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
        method: restrictedMethod,
        params: {},
      }),
    ).rejects.toThrow(
      'Must specify a valid JSON-RPC request object as single parameter.',
    );

    expect(hooks.getSnap).toHaveBeenCalledTimes(0);
    expect(hooks.handleSnapRpcRequest).not.toHaveBeenCalled();
  });
});
