import { createDeferredPromise } from '@metamask/utils';

import { withMutex } from './mutex';

describe('withMutex', () => {
  it('runs the function with a mutex', async () => {
    jest.useFakeTimers();

    const { promise, resolve: resolveDeferred } = createDeferredPromise();

    const fn = jest.fn().mockImplementation(async () => {
      return await new Promise<void>((resolve) => {
        resolveDeferred();
        setTimeout(() => {
          resolve();
        }, 1000);
      });
    });

    const wrappedFn = withMutex(fn);

    const first = wrappedFn();
    const second = wrappedFn();

    await promise;
    jest.advanceTimersByTime(1000);

    expect(fn).toHaveBeenCalledTimes(1);

    await first;

    jest.advanceTimersByTime(1000);

    await second;

    expect(fn).toHaveBeenCalledTimes(2);
  });
});
