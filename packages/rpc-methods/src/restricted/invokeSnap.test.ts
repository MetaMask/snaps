import {
  Caveat,
  OriginString,
  PermissionType,
} from '@metamask/permission-controller';
import { SnapCaveatType, SnapId } from '@metamask/snaps-utils';
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
  InvokeSnapCaveatSpecifications,
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
      'Expected caveat to have a value property of a non-empty object of snap IDs.',
    );
    expect(() => validateCaveat(emptyValueCaveat)).toThrow(
      'Expected caveat to have a value property of a non-empty object of snap IDs.',
    );
  });
});

describe('InvokeSnapCaveatSpecifications', () => {
  describe('validator', () => {
    it('throws for an invalid caveat object', () => {
      expect(() => {
        InvokeSnapCaveatSpecifications[SnapCaveatType.SnapIds].validator?.({
          type: SnapCaveatType.SnapIds,
          value: {},
        });
      }).toThrow(
        'Expected caveat to have a value property of a non-empty object of snap IDs.',
      );
    });
  });

  describe('decorator', () => {
    const params: { snapId: SnapId } = { snapId: MOCK_SNAP_ID };
    const context: { origin: OriginString } = { origin: MOCK_ORIGIN };
    it('returns the result of the method implementation', async () => {
      const caveat = {
        type: SnapCaveatType.SnapIds,
        value: { [MOCK_SNAP_ID]: {} },
      };
      const method = jest.fn().mockImplementation(() => 'foo');
      expect(
        await InvokeSnapCaveatSpecifications[SnapCaveatType.SnapIds].decorator(
          method,
          caveat,
        )({ method: 'hello', params, context }),
      ).toBe('foo');
    });

    it('throws if the origin trying to invoke the snap does not have its permission', async () => {
      const method = jest.fn().mockImplementation(() => 'foo');
      const caveat = { type: SnapCaveatType.SnapIds, value: { foo: {} } };
      await expect(
        InvokeSnapCaveatSpecifications[SnapCaveatType.SnapIds].decorator(
          method,
          caveat,
        )({ method: 'hello', params, context }),
      ).rejects.toThrow(
        `${MOCK_ORIGIN} does not have permission to invoke ${MOCK_SNAP_ID} snap.`,
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
