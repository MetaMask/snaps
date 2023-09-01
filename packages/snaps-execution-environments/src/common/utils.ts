import type { StreamProvider } from '@metamask/providers';
import type { RequestArguments } from '@metamask/providers/dist/BaseProvider';
import { assert, assertStruct, JsonStruct } from '@metamask/utils';
import { ethErrors } from 'eth-rpc-errors';

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
export async function withTeardown<Type>(
  originalPromise: Promise<Type>,
  teardownRef: { lastTeardown: number },
): Promise<Type> {
  const myTeardown = teardownRef.lastTeardown;
  return new Promise<Type>((resolve, reject) => {
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

// We're blocking these RPC methods for v1, will revisit later.
export const BLOCKED_RPC_METHODS = Object.freeze([
  'wallet_requestSnaps',
  'wallet_requestPermissions',
  // We disallow all of these confirmations for now, since the screens are not ready for Snaps.
  'eth_sendRawTransaction',
  'eth_sendTransaction',
  'eth_sign',
  'eth_signTypedData',
  'eth_signTypedData_v1',
  'eth_signTypedData_v3',
  'eth_signTypedData_v4',
  'eth_decrypt',
  'eth_getEncryptionPublicKey',
  'wallet_addEthereumChain',
  'wallet_switchEthereumChain',
  'wallet_watchAsset',
  'wallet_registerOnboarding',
  'wallet_scanQRCode',
]);

/**
 * Asserts the validity of request arguments for a snap outbound request using the `snap.request` API.
 *
 * @param args - The arguments to validate.
 */
export function assertSnapOutboundRequest(args: RequestArguments) {
  // Disallow any non `wallet_` or `snap_` methods for separation of concerns.
  assert(
    String.prototype.startsWith.call(args.method, 'wallet_') ||
      String.prototype.startsWith.call(args.method, 'snap_'),
    'The global Snap API only allows RPC methods starting with `wallet_*` and `snap_*`.',
  );
  assert(
    !BLOCKED_RPC_METHODS.includes(args.method),
    ethErrors.rpc.methodNotFound({
      data: {
        method: args.method,
      },
    }),
  );
  assertStruct(args, JsonStruct, 'Provided value is not JSON-RPC compatible');
}

/**
 * Asserts the validity of request arguments for an ethereum outbound request using the `ethereum.request` API.
 *
 * @param args - The arguments to validate.
 */
export function assertEthereumOutboundRequest(args: RequestArguments) {
  // Disallow snaps methods for separation of concerns.
  assert(
    !String.prototype.startsWith.call(args.method, 'snap_'),
    ethErrors.rpc.methodNotFound({
      data: {
        method: args.method,
      },
    }),
  );
  assert(
    !BLOCKED_RPC_METHODS.includes(args.method),
    ethErrors.rpc.methodNotFound({
      data: {
        method: args.method,
      },
    }),
  );
  assertStruct(args, JsonStruct, 'Provided value is not JSON-RPC compatible');
}
