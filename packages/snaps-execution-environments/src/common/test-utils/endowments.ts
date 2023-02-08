// @ts-expect-error Walker has no types yet.
import LavaTube from '@lavamoat/lavatube';
import ObjectMultiplex from '@metamask/object-multiplex';
import { StreamProvider } from '@metamask/providers';
import { RequestArguments } from '@metamask/providers/dist/BaseProvider';
import { SNAP_STREAM_NAMES } from '@metamask/snaps-utils';
import { assert } from '@metamask/utils';
import { ethErrors } from 'eth-rpc-errors';
import { createIdRemapMiddleware } from 'json-rpc-engine';

import { proxyStreamProvider, withTeardown } from '../utils';

// These are fake types just to make this test work with the TypeScript
/* eslint-disable @typescript-eslint/naming-convention */
export type HardenedEndowmentSubject = {
  __flag: unknown;
  prototype: { __flag: unknown };
};
export type HardenedEndowmentInstance = {
  __flag: unknown;
  __proto__: { __flag: unknown };
};
/* eslint-enable @typescript-eslint/naming-convention */

/**
 * This function represents utility which is executed inside a compartment.
 * It will try to change a subject or its prototype.
 * Potential errors are caught and reported in an array returned.
 *
 * @param subject - Test subject (instance, object, function).
 * @param factory - Factory that creates an instance using constructor function.
 * @returns Array of error messages.
 */
export function testEndowmentHardening(
  subject: HardenedEndowmentSubject,
  factory: () => HardenedEndowmentInstance,
): unknown[] {
  const log = [];
  const instance = factory();
  try {
    subject.__flag = 'not_secure';
  } catch (error) {
    log.push(error.message);
  }
  try {
    if (instance) {
      instance.__flag = 'not_secure';
    }
  } catch (error) {
    log.push(error.message);
  }
  try {
    subject.prototype.__flag = 'not_secure';
  } catch (error) {
    log.push(error.message);
  }
  try {
    // eslint-disable-next-line no-proto
    instance.__proto__.__flag = 'not_secure';
  } catch (error) {
    log.push(error.message);
  }
  try {
    // @ts-expect-error Test unusual approach for a security reasons.
    // eslint-disable-next-line no-proto
    subject.__proto__.__flag = 'not_secure';
  } catch (error) {
    log.push(error.message);
  }
  return log;
}

/**
 * Object walker test utility function.
 * This function will instantiate and configure @lavamoat/lavatube for testing
 * endowment specific use case. It will also adapt its result to a boolean value.
 *
 * @param subject - Subject to be tested.
 * @param target - Target object.
 * @returns True if target object is found, false otherwise.
 */
export function walkAndSearch(subject: unknown, target: unknown) {
  let result = false;
  const walker = new LavaTube(
    (value: unknown) => {
      result = target === value;
      return result;
    },
    { maxRecursionLimit: 100, onShouldIgnoreError: () => true },
  );
  walker.walk(subject);
  return result;
}

/**
 * Create and return mocked stream provider instance used for testing.
 * Note: Stream is wrapped in a Proxy to simulate limited provider used in
 * BaseSnapExecutor for ethereum endowment.
 *
 * @returns Proxy to StreamProvider instance.
 */
export function getMockedStreamProvider() {
  const mux = new ObjectMultiplex();
  const rpcStream = mux.createStream(SNAP_STREAM_NAMES.JSON_RPC);

  const provider = new StreamProvider(rpcStream, {
    jsonRpcStreamName: 'metamask-provider',
    rpcMiddleware: [createIdRemapMiddleware()],
  });

  const originalRequest = provider.request.bind(provider);

  const request = async (args: RequestArguments) => {
    assert(
      !args.method.startsWith('snap_'),
      ethErrors.rpc.methodNotFound({
        data: {
          method: args.method,
        },
      }),
    );
    return await withTeardown(originalRequest(args), { lastTeardown: 0 });
  };

  return proxyStreamProvider(provider, request);
}
