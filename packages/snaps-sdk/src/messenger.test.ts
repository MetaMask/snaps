import { getMessenger } from './messenger';
import type { SnapsProvider } from './types';

type FooBarAction = {
  type: 'Foo:bar';
  handler: (parameter: string) => string;
};

describe('getMessenger', () => {
  it('calls `snap_messengerCall` with the action and params', async () => {
    const request = jest
      .fn()
      .mockImplementation(async ({ params }) => params.params[0]);

    Object.assign(globalThis, {
      snap: { request } as unknown as SnapsProvider,
    });

    const messenger = getMessenger<FooBarAction>();

    const result = await messenger.call('Foo:bar', 'baz');

    expect(result).toBe('baz');

    expect(request).toHaveBeenCalledWith({
      method: 'snap_messengerCall',
      params: { action: 'Foo:bar', params: ['baz'] },
    });
  });
});
