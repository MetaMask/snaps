import type { StreamProvider } from '@metamask/providers';
import type { RequestArguments } from '@metamask/providers/dist/BaseProvider';
import { rpcErrors } from '@metamask/rpc-errors';
import {
  assert,
  assertStruct,
  getJsonSize,
  getSafeJson,
  isObject,
  JsonStruct,
} from '@metamask/utils';

import { log } from '../logging';

// 64 MB - we chose this number because it is the size limit for postMessage
// between the extension and the dapp enforced by Chrome.
const MAX_RESPONSE_JSON_SIZE = 64_000_000;

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
  'wallet_revokePermissions',
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
    rpcErrors.methodNotSupported,
  );
  assert(
    !BLOCKED_RPC_METHODS.includes(args.method),
    rpcErrors.methodNotFound({
      data: {
        method: args.method,
      },
    }),
  );
  assertStruct(
    args,
    JsonStruct,
    'Provided value is not JSON-RPC compatible',
    rpcErrors.invalidParams,
  );
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
    rpcErrors.methodNotFound({
      data: {
        method: args.method,
      },
    }),
  );
  assert(
    !BLOCKED_RPC_METHODS.includes(args.method),
    rpcErrors.methodNotFound({
      data: {
        method: args.method,
      },
    }),
  );
  assertStruct(
    args,
    JsonStruct,
    'Provided value is not JSON-RPC compatible',
    rpcErrors.invalidParams,
  );
}

/**
 * Gets a sanitized value to be used for passing to the underlying MetaMask provider.
 *
 * @param value - An unsanitized value from a snap.
 * @returns A sanitized value ready to be passed to a MetaMask provider.
 */
export function sanitizeRequestArguments(value: unknown): RequestArguments {
  // Before passing to getSafeJson we run the value through JSON serialization.
  // This lets request arguments contain undefined which is normally disallowed.
  const json = JSON.parse(JSON.stringify(value));
  return getSafeJson(json) as RequestArguments;
}

/**
 * Check if the input is a valid response.
 *
 * @param response - The response.
 * @returns True if the response is valid, otherwise false.
 */
export function isValidResponse(response: Record<string, unknown>) {
  if (!isObject(response)) {
    return false;
  }

  try {
    // If the JSON is invalid this will throw and we should return false.
    const size = getJsonSize(response);
    return size < MAX_RESPONSE_JSON_SIZE;
  } catch {
    return false;
  }
}
