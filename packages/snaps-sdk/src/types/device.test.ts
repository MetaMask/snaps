import { is } from '@metamask/superstruct';
import { expectTypeOf } from 'expect-type';

import type { DeviceId, ScopedDeviceId } from './device';
import { deviceId, DeviceTypeStruct } from './device';

describe('DeviceTypeStruct', () => {
  it('only accepts `hid`', () => {
    expect(is('hid', DeviceTypeStruct)).toBe(true);
  });

  it('does not accept unknown device types', () => {
    expect(is('bluetooth', DeviceTypeStruct)).toBe(false);
  });
});

describe('DeviceId', () => {
  it('has a colon separated device type and identifier', () => {
    expectTypeOf<'hid:1:2'>().toMatchTypeOf<DeviceId>();
  });

  it('does not accept unknown device types', () => {
    expectTypeOf<'bluetooth:1:2'>().not.toMatchTypeOf<DeviceId>();
  });
});

describe('ScopedDeviceId', () => {
  it('has a colon separated device type and identifier', () => {
    expectTypeOf<'hid:1:2'>().toMatchTypeOf<ScopedDeviceId<'hid'>>();
  });

  it('does not accept unknown device types', () => {
    expectTypeOf<'bluetooth:1:2'>().not.toMatchTypeOf<ScopedDeviceId<'hid'>>();
  });
});

describe('deviceId', () => {
  it('creates a scoped device ID struct', () => {
    const struct = deviceId('hid');

    expect(is('hid:1:2', struct)).toBe(true);
    expect(is('bluetooth:1:2', struct)).toBe(false);
  });

  it('creates a device ID struct', () => {
    const struct = deviceId();

    expect(is('hid:1:2', struct)).toBe(true);
    expect(is('bluetooth:1:2', struct)).toBe(true);
  });
});
