import {
  assertIsEvent,
  assertIsMetaMaskNotification,
  isEvent,
  isMetaMaskNotification,
} from './notification';

describe('isEvent', () => {
  it.each([
    {
      name: 'foo',
      data: {},
    },
    {
      name: 'bar',
      data: [],
    },
    {
      name: 'baz',
      data: 1,
    },
    {
      name: 'qux',
      data: 'quux',
    },
  ])(`returns true for a valid event`, (event) => {
    expect(isEvent(event)).toBe(true);
  });

  it.each([
    {},
    [],
    true,
    false,
    null,
    undefined,
    1,
    'foo',
    { data: {} },
    { name: {}, data: {} },
    { name: [], data: {} },
    { name: true, data: {} },
    { name: false, data: {} },
    { name: null, data: {} },
    { name: undefined, data: {} },
    { name: 1, data: {} },
  ])(`returns false for an invalid event`, (event) => {
    expect(isEvent(event)).toBe(false);
  });
});

describe('assertIsEvent', () => {
  it.each([
    {
      name: 'foo',
      data: {},
    },
    {
      name: 'bar',
      data: [],
    },
    {
      name: 'baz',
      data: 1,
    },
    {
      name: 'qux',
      data: 'quux',
    },
  ])(`does not throw for a valid event`, (event) => {
    expect(() => assertIsEvent(event)).not.toThrow();
  });

  it.each([
    {},
    [],
    true,
    false,
    null,
    undefined,
    1,
    'foo',
    { data: {} },
    { name: {}, data: {} },
    { name: [], data: {} },
    { name: true, data: {} },
    { name: false, data: {} },
    { name: null, data: {} },
    { name: undefined, data: {} },
    { name: 1, data: {} },
  ])(`throws for an invalid event`, (event) => {
    expect(() => assertIsEvent(event)).toThrow('Invalid event');
  });
});

describe('isMetaMaskNotification', () => {
  it.each([
    {
      method: 'multichainHack_metamask_event',
      params: {
        chainId: 'eip155:1',
        event: {
          name: 'foo',
          data: {},
        },
      },
    },
    {
      method: 'multichainHack_metamask_event',
      params: {
        chainId: 'bip122:000000000019d6689c085ae165831e93',
        event: {
          name: 'bar',
          data: [],
        },
      },
    },
  ])('returns true for a valid notification', (notification) => {
    expect(isMetaMaskNotification(notification)).toBe(true);
  });

  it.each([
    {},
    [],
    true,
    false,
    null,
    undefined,
    1,
    'foo',
    { method: 'foo' },
    { params: {} },
    { method: {}, params: {} },
    { method: [], params: {} },
    { method: true, params: {} },
    { method: false, params: {} },
    { method: null, params: {} },
    { method: undefined, params: {} },
    { method: 1, params: {} },
    { method: 'multichainHack_metamask_event' },
    { method: 'multichainHack_metamask_event', params: [] },
    { method: 'multichainHack_metamask_event', params: true },
    { method: 'multichainHack_metamask_event', params: false },
    { method: 'multichainHack_metamask_event', params: null },
    { method: 'multichainHack_metamask_event', params: undefined },
    { method: 'multichainHack_metamask_event', params: 1 },
    { method: 'multichainHack_metamask_event', params: 'foo' },
    { method: 'multichainHack_metamask_event', params: { chainId: 'foo' } },
    {
      method: 'multichainHack_metamask_event',
      params: { chainId: 'foo', event: {} },
    },
    {
      method: 'multichainHack_metamask_event',
      params: { chainId: 'foo', event: { name: 'foo' } },
    },
    {
      method: 'multichainHack_metamask_event',
      params: { chainId: 'foo', event: { data: {} } },
    },
    {
      method: 'multichainHack_metamask_event',
      params: { chainId: 'foo', event: { name: {}, data: {} } },
    },
    {
      method: 'multichainHack_metamask_event',
      params: { chainId: 'foo', event: { name: [], data: {} } },
    },
    {
      method: 'multichainHack_metamask_event',
      params: { chainId: 'foo', event: { name: true, data: {} } },
    },
    {
      method: 'multichainHack_metamask_event',
      params: { chainId: 'foo', event: { name: false, data: {} } },
    },
    {
      method: 'multichainHack_metamask_event',
      params: { chainId: 'foo', event: { name: null, data: {} } },
    },
    {
      method: 'multichainHack_metamask_event',
      params: { chainId: 'foo', event: { name: undefined, data: {} } },
    },
    {
      method: 'multichainHack_metamask_event',
      params: { chainId: 'foo', event: { name: 1, data: {} } },
    },
  ])('returns false for an invalid notification', (notification) => {
    expect(isMetaMaskNotification(notification)).toBe(false);
  });
});

describe('assertIsMetaMaskNotification', () => {
  it.each([
    {
      method: 'multichainHack_metamask_event',
      params: {
        chainId: 'eip155:1',
        event: {
          name: 'foo',
          data: {},
        },
      },
    },
    {
      method: 'multichainHack_metamask_event',
      params: {
        chainId: 'bip122:000000000019d6689c085ae165831e93',
        event: {
          name: 'bar',
          data: [],
        },
      },
    },
  ])('does not throw for a valid notification', (notification) => {
    expect(() => assertIsMetaMaskNotification(notification)).not.toThrow();
  });

  it.each([
    {},
    [],
    true,
    false,
    null,
    undefined,
    1,
    'foo',
    { method: 'foo' },
    { params: {} },
    { method: {}, params: {} },
    { method: [], params: {} },
    { method: true, params: {} },
    { method: false, params: {} },
    { method: null, params: {} },
    { method: undefined, params: {} },
    { method: 1, params: {} },
    { method: 'multichainHack_metamask_event' },
    { method: 'multichainHack_metamask_event', params: [] },
    { method: 'multichainHack_metamask_event', params: true },
    { method: 'multichainHack_metamask_event', params: false },
    { method: 'multichainHack_metamask_event', params: null },
    { method: 'multichainHack_metamask_event', params: undefined },
    { method: 'multichainHack_metamask_event', params: 1 },
    { method: 'multichainHack_metamask_event', params: 'foo' },
    { method: 'multichainHack_metamask_event', params: { chainId: 'foo' } },
    {
      method: 'multichainHack_metamask_event',
      params: { chainId: 'foo', event: {} },
    },
    {
      method: 'multichainHack_metamask_event',
      params: { chainId: 'foo', event: { name: 'foo' } },
    },
    {
      method: 'multichainHack_metamask_event',
      params: { chainId: 'foo', event: { data: {} } },
    },
    {
      method: 'multichainHack_metamask_event',
      params: { chainId: 'foo', event: { name: {}, data: {} } },
    },
    {
      method: 'multichainHack_metamask_event',
      params: { chainId: 'foo', event: { name: [], data: {} } },
    },
    {
      method: 'multichainHack_metamask_event',
      params: { chainId: 'foo', event: { name: true, data: {} } },
    },
    {
      method: 'multichainHack_metamask_event',
      params: { chainId: 'foo', event: { name: false, data: {} } },
    },
    {
      method: 'multichainHack_metamask_event',
      params: { chainId: 'foo', event: { name: null, data: {} } },
    },
    {
      method: 'multichainHack_metamask_event',
      params: { chainId: 'foo', event: { name: undefined, data: {} } },
    },
    {
      method: 'multichainHack_metamask_event',
      params: { chainId: 'foo', event: { name: 1, data: {} } },
    },
  ])('throws for an invalid notification', (notification) => {
    expect(() => assertIsMetaMaskNotification(notification)).toThrow(
      'Invalid notification',
    );
  });
});
