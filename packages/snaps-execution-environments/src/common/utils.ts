import { StreamProvider } from '@metamask/providers';

import { log } from '../logging';

/**
 * Takes an error that was thrown, determines if it is
 * an error object. If it is then it will return that. Otherwise,
 * an error object is created with the original error message.
 *
 * @param originalError - The error that was originally thrown.
 * @returns An error object.
 */
export function constructError(originalError: unknown) {
  let _originalError: Error | undefined;
  if (originalError instanceof Error) {
    _originalError = originalError;
  } else if (typeof originalError === 'string') {
    _originalError = new Error(originalError);
    // The stack is useless in this case.
    delete _originalError.stack;
  }
  return _originalError;
}

/**
 * Make proxy for Promise and handle the teardown process properly.
 * If the teardown is called in the meanwhile, Promise result will not be
 * exposed to the snap anymore and warning will be logged to the console.
 *
 * @param originalPromise - Original promise.
 * @param teardownRef - Reference containing teardown count.
 * @param teardownRef.lastTeardown - Number of the last teardown.
 * @returns New proxy promise.
 */
export async function withTeardown<T>(
  originalPromise: Promise<T>,
  teardownRef: { lastTeardown: number },
): Promise<T> {
  const myTeardown = teardownRef.lastTeardown;
  return new Promise<T>((resolve, reject) => {
    originalPromise
      .then((value) => {
        if (teardownRef.lastTeardown === myTeardown) {
          resolve(value);
        } else {
          log(
            'Late promise received after Snap finished execution. Promise will be dropped.',
          );
        }
      })
      .catch((reason) => {
        if (teardownRef.lastTeardown === myTeardown) {
          reject(reason);
        } else {
          log(
            'Late promise received after Snap finished execution. Promise will be dropped.',
          );
        }
      });
  });
}

/**
 * Returns a Proxy that narrows down (attenuates) the fields available on
 * the StreamProvider and replaces the request implementation.
 *
 * @param provider - Instance of a StreamProvider to be limited.
 * @param request - Custom attenuated request object.
 * @returns Proxy to the StreamProvider instance.
 */
export function proxyStreamProvider(
  provider: StreamProvider,
  request: unknown,
): StreamProvider {
  // Proxy target is intentionally set to be an empty object, to ensure
  // that access to the prototype chain is not possible.
  const proxy = new Proxy(
    {},
    {
      has(_target: object, prop: string | symbol) {
        return (
          typeof prop === 'string' &&
          ['request', 'on', 'removeListener'].includes(prop)
        );
      },
      get(_target, prop: keyof StreamProvider) {
        if (prop === 'request') {
          return request;
        } else if (['on', 'removeListener'].includes(prop)) {
          return provider[prop];
        }

        return undefined;
      },
    },
  );

  return proxy as StreamProvider;
}
