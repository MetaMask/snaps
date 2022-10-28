import { PermissionConstraint, PermissionType } from '@metamask/controllers';
import { SnapCaveatType } from '@metamask/snap-utils';
import { getNamespace } from '@metamask/snap-utils/test-utils';
import { SnapEndowments } from './enum';
import {
  getKeyringCaveatNamespaces,
  keyringCaveatSpecifications,
  keyringEndowmentBuilder,
} from './keyring';

describe('specificationBuilder', () => {
  const specification = keyringEndowmentBuilder.specificationBuilder({});

  it('builds the expected permission specification', () => {
    expect(specification).toStrictEqual({
      permissionType: PermissionType.Endowment,
      targetKey: SnapEndowments.Keyring,
      allowedCaveats: [SnapCaveatType.SnapKeyring],
      endowmentGetter: expect.any(Function),
      validator: expect.any(Function),
    });

    expect(specification.endowmentGetter()).toBeUndefined();
  });

  describe('validator', () => {
    it('throws if the caveat is not a single "snapKeyring"', () => {
      expect(() =>
        // @ts-expect-error Missing required permission types.
        specification.validator({}),
      ).toThrow('Expected a single "snapKeyring" caveat.');

      expect(() =>
        // @ts-expect-error Missing other required permission types.
        specification.validator({
          caveats: [{ type: 'foo', value: 'bar' }],
        }),
      ).toThrow('Expected a single "snapKeyring" caveat.');

      expect(() =>
        // @ts-expect-error Missing other required permission types.
        specification.validator({
          caveats: [
            { type: 'snapKeyring', value: [] },
            { type: 'snapKeyring', value: [] },
          ],
        }),
      ).toThrow('Expected a single "snapKeyring" caveat.');
    });
  });
});

describe('getKeyringCaveatNamespaces', () => {
  it('returns the namespaces from a keyring permission', () => {
    const permission: PermissionConstraint = {
      date: 0,
      parentCapability: 'foo',
      invoker: 'bar',
      id: 'baz',
      caveats: [
        {
          type: SnapCaveatType.SnapKeyring,
          value: {
            namespaces: {
              eip155: getNamespace(),
            },
          },
        },
      ],
    };

    expect(getKeyringCaveatNamespaces(permission)).toStrictEqual({
      eip155: getNamespace(),
    });
  });

  it('returns null if the input is undefined', () => {
    expect(getKeyringCaveatNamespaces(undefined)).toBeNull();
  });

  it('returns null if the permission does not have caveats', () => {
    const permission: PermissionConstraint = {
      date: 0,
      parentCapability: 'foo',
      invoker: 'bar',
      id: 'baz',
      caveats: null,
    };

    expect(getKeyringCaveatNamespaces(permission)).toBeNull();
  });

  it('returns null if the caveat value does not have a "namespaces" property', () => {
    const permission: PermissionConstraint = {
      date: 0,
      parentCapability: 'foo',
      invoker: 'bar',
      id: 'baz',
      caveats: [
        {
          type: SnapCaveatType.SnapKeyring,
          value: {
            foo: 'bar',
          },
        },
      ],
    };

    expect(getKeyringCaveatNamespaces(permission)).toBeNull();
  });

  it('throws if the permission does not have exactly one caveat', () => {
    const permission: PermissionConstraint = {
      date: 0,
      parentCapability: 'foo',
      invoker: 'bar',
      id: 'baz',
      caveats: [
        {
          type: SnapCaveatType.SnapKeyring,
          value: {
            namespaces: {
              eip155: getNamespace(),
            },
          },
        },
        {
          type: SnapCaveatType.SnapKeyring,
          value: {
            namespaces: {
              eip155: getNamespace(),
            },
          },
        },
      ],
    };

    expect(() => getKeyringCaveatNamespaces(permission)).toThrow(
      'Assertion failed',
    );
  });

  it('throws if the first caveat is not a "snapKeyring" caveat', () => {
    const permission: PermissionConstraint = {
      date: 0,
      parentCapability: 'foo',
      invoker: 'bar',
      id: 'baz',
      caveats: [
        {
          type: SnapCaveatType.PermittedCoinTypes,
          value: {
            namespaces: {
              eip155: getNamespace(),
            },
          },
        },
      ],
    };

    expect(() => getKeyringCaveatNamespaces(permission)).toThrow(
      'Assertion failed',
    );
  });
});

describe('keyringCaveatSpecifications', () => {
  describe('validator', () => {
    it('throws if the caveat values are invalid', () => {
      expect(() =>
        // @ts-expect-error Missing value type.
        keyringCaveatSpecifications[SnapCaveatType.SnapKeyring].validator?.({
          type: SnapCaveatType.SnapKeyring,
        }),
      ).toThrow('Expected a plain object.');

      expect(() =>
        keyringCaveatSpecifications[SnapCaveatType.SnapKeyring].validator?.({
          type: SnapCaveatType.SnapKeyring,
          value: {
            namespaces: undefined,
          },
        }),
      ).toThrow(
        'Invalid namespaces object: Expected an object, but received: undefined.',
      );
    });
  });
});
