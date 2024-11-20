import { is } from '@metamask/superstruct';

import { DeviceFilterStruct } from './request-device';

describe('DeviceFilterStruct', () => {
  it.each([
    {
      vendorId: 1,
      productId: 2,
    },
    {
      vendorId: 3,
    },
    {
      productId: 4,
    },
    {},
  ])(`accepts %p`, (filter) => {
    expect(is(filter, DeviceFilterStruct)).toBe(true);
  });

  it.each([
    true,
    false,
    null,
    undefined,
    'string',
    1,
    {
      vendorId: '1',
      productId: 2,
    },
    {
      vendorId: 3,
      productId: '2',
    },
    {
      vendorId: '3',
      productId: '4',
    },
    {
      vendorId: 1,
      productId: '2',
    },
    {
      vendorId: '1',
      productId: 2,
    },
    {
      vendorId: '3',
      productId: '4',
    },
    {
      vendorId: '1',
      productId: '2',
    },
    {
      vendorId: '3',
      productId: '4',
    },
    {
      vendorId: '1',
      productId: '2',
    },
  ])(`rejects %p`, (filter) => {
    expect(is(filter, DeviceFilterStruct)).toBe(false);
  });
});
