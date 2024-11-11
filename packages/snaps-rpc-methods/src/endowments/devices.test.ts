import type { PermissionConstraint } from '@metamask/permission-controller';
import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { SnapCaveatType } from '@metamask/snaps-utils';

import {
  getPermittedDeviceIds,
  devicesEndowmentBuilder,
  validateDeviceIdsCaveat,
  deviceIdsCaveatSpecifications,
} from './devices';
import { SnapEndowments } from './enum';

describe('endowment:devices', () => {
  const specification = devicesEndowmentBuilder.specificationBuilder({});

  it('builds the expected permission specification', () => {
    expect(specification).toStrictEqual({
      permissionType: PermissionType.Endowment,
      targetName: SnapEndowments.Devices,
      endowmentGetter: expect.any(Function),
      allowedCaveats: [SnapCaveatType.DeviceIds],
      subjectTypes: [SubjectType.Snap],
      validator: expect.any(Function),
    });

    expect(specification.endowmentGetter()).toBeNull();
  });

  describe('validator', () => {
    it('allows no caveats', () => {
      expect(() =>
        // @ts-expect-error Missing required permission types.
        specification.validator({}),
      ).not.toThrow();
    });

    it('throws if the caveats are not one or both of "chainIds" and "lookupMatchers".', () => {
      expect(() =>
        // @ts-expect-error Missing other required permission types.
        specification.validator({
          caveats: [{ type: 'foo', value: 'bar' }],
        }),
      ).toThrow('Expected the following caveats: "deviceIds", received "foo".');

      expect(() =>
        // @ts-expect-error Missing other required permission types.
        specification.validator({
          caveats: [
            { type: 'chainIds', value: ['foo'] },
            { type: 'chainIds', value: ['bar'] },
          ],
        }),
      ).toThrow('Duplicate caveats are not allowed.');
    });
  });
});

describe('getPermittedDeviceIds', () => {
  it('returns the value from the `endowment:devices` permission', () => {
    const permission: PermissionConstraint = {
      date: 0,
      parentCapability: 'foo',
      invoker: 'bar',
      id: 'baz',
      caveats: [
        {
          type: SnapCaveatType.DeviceIds,
          value: {
            devices: [
              {
                deviceId: 'hid:123:456',
              },
            ],
          },
        },
      ],
    };

    expect(getPermittedDeviceIds(permission)).toStrictEqual([
      {
        deviceId: 'hid:123:456',
      },
    ]);
  });

  it('returns `null` if the input is `undefined`', () => {
    expect(getPermittedDeviceIds(undefined)).toBeNull();
  });

  it('returns `null` if the permission does not have caveats', () => {
    const permission: PermissionConstraint = {
      date: 0,
      parentCapability: 'foo',
      invoker: 'bar',
      id: 'baz',
      caveats: null,
    };

    expect(getPermittedDeviceIds(permission)).toBeNull();
  });

  it(`returns \`null\` if the caveat doesn't have devices`, () => {
    const permission: PermissionConstraint = {
      date: 0,
      parentCapability: 'foo',
      invoker: 'bar',
      id: 'baz',
      caveats: [
        {
          type: SnapCaveatType.DeviceIds,
          value: {},
        },
      ],
    };

    expect(getPermittedDeviceIds(permission)).toBeNull();
  });

  it('throws if the caveat is not a `deviceIds` caveat', () => {
    const permission: PermissionConstraint = {
      date: 0,
      parentCapability: 'foo',
      invoker: 'bar',
      id: 'baz',
      caveats: [
        {
          type: SnapCaveatType.ChainIds,
          value: 'foo',
        },
      ],
    };

    expect(() => getPermittedDeviceIds(permission)).toThrow(
      'Assertion failed.',
    );
  });
});

describe('validateDeviceIdsCaveat', () => {
  it('throws if the value is not a plain object', () => {
    expect(() =>
      // @ts-expect-error Missing required permission types.
      validateDeviceIdsCaveat({}),
    ).toThrow('Expected a plain object.');
  });

  it('throws if the value does not have a `devices` property', () => {
    expect(() =>
      // @ts-expect-error Missing required permission types.
      validateDeviceIdsCaveat({ value: {} }),
    ).toThrow('Expected a valid device specification array.');
  });

  it('throws if the `devices` property is not a valid device specification array', () => {
    expect(() =>
      // @ts-expect-error Missing required permission types.
      validateDeviceIdsCaveat({ value: { devices: 'foo' } }),
    ).toThrow('Expected a valid device specification array.');
  });
});

describe('deviceIdsCaveatSpecifications', () => {
  describe('validator', () => {
    it('validates the device IDs caveat', () => {
      const caveat = {
        type: SnapCaveatType.DeviceIds,
        value: {
          devices: [
            {
              deviceId: 'hid:123:456',
            },
          ],
        },
      };

      expect(() =>
        deviceIdsCaveatSpecifications[SnapCaveatType.DeviceIds]?.validator?.(
          caveat,
        ),
      ).not.toThrow();
    });
  });

  describe('merger', () => {
    it('merges the device IDs from two caveats', () => {
      const leftValue = {
        devices: [
          {
            deviceId: 'hid:123:456',
          },
        ],
      };
      const rightValue = {
        devices: [
          {
            deviceId: 'hid:789:012',
          },
        ],
      };

      expect(
        deviceIdsCaveatSpecifications[SnapCaveatType.DeviceIds]?.merger?.(
          leftValue,
          rightValue,
        ),
      ).toStrictEqual([
        {
          devices: [
            {
              deviceId: 'hid:123:456',
            },
            {
              deviceId: 'hid:789:012',
            },
          ],
        },
        {
          devices: [
            {
              deviceId: 'hid:789:012',
            },
          ],
        },
      ]);
    });
  });
});
