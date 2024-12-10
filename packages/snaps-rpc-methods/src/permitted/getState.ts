import type { JsonRpcEngineEndCallback } from '@metamask/json-rpc-engine';
import type { PermittedHandlerExport } from '@metamask/permission-controller';
import { providerErrors, rpcErrors } from '@metamask/rpc-errors';
import type { GetStateParams, GetStateResult } from '@metamask/snaps-sdk';
import { type InferMatching } from '@metamask/snaps-utils';
import {
  boolean,
  create,
  object,
  optional,
  string,
  StructError,
} from '@metamask/superstruct';
import type { PendingJsonRpcResponse, JsonRpcRequest } from '@metamask/utils';
import { hasProperty, isPlainObject, type Json } from '@metamask/utils';

import { manageStateBuilder } from '../restricted/manageState';
import type { MethodHooksObject } from '../utils';

const hookNames: MethodHooksObject<GetStateHooks> = {
  hasPermission: true,
  getSnapState: true,
  getUnlockPromise: true,
};

/**
 * `snap_getState` gets the state of the Snap.
 */
export const getStateHandler: PermittedHandlerExport<
  GetStateHooks,
  GetStateParameters,
  GetStateResult
> = {
  methodNames: ['snap_getState'],
  implementation: getStateImplementation,
  hookNames,
};

export type GetStateHooks = {
  /**
   * Check if the requesting origin has a given permission.
   *
   * @param permissionName - The name of the permission to check.
   * @returns Whether the origin has the permission.
   */
  hasPermission: (permissionName: string) => boolean;

  /**
   * Get the state of the requesting Snap.
   *
   * @returns The current state of the Snap.
   */
  getSnapState: (
    snapId: string,
    encrypted: boolean,
  ) => Promise<Record<string, Json>>;

  /**
   * Wait for the extension to be unlocked.
   *
   * @returns A promise that resolves once the extension is unlocked.
   */
  getUnlockPromise: (shouldShowUnlockRequest: boolean) => Promise<void>;
};

const GetStateParametersStruct = object({
  key: optional(string()),
  encrypted: optional(boolean()),
});

export type GetStateParameters = InferMatching<
  typeof GetStateParametersStruct,
  GetStateParams
>;

/**
 * The `snap_getState` method implementation.
 *
 * @param request - The JSON-RPC request object.
 * @param response - The JSON-RPC response object.
 * @param _next - The `json-rpc-engine` "next" callback. Not used by this
 * function.
 * @param end - The `json-rpc-engine` "end" callback.
 * @param hooks - The RPC method hooks.
 * @param hooks.hasPermission - Check whether a given origin has a given
 * permission.
 * @param hooks.getSnapState - Get the state of the requesting Snap.
 * @param hooks.getUnlockPromise - Wait for the extension to be unlocked.
 * @returns Nothing.
 */
async function getStateImplementation(
  request: JsonRpcRequest<GetStateParameters>,
  response: PendingJsonRpcResponse<GetStateResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  { hasPermission, getSnapState, getUnlockPromise }: GetStateHooks,
): Promise<void> {
  const { params } = request;

  if (!hasPermission(manageStateBuilder.targetName)) {
    return end(providerErrors.unauthorized());
  }

  try {
    const validatedParams = getValidatedParams(params);
    const { key, encrypted = true } = validatedParams;

    if (encrypted) {
      await getUnlockPromise(true);
    }

    // We expect the MM middleware stack to always add the origin to requests
    const { origin } = request as JsonRpcRequest & { origin: string };
    const state = await getSnapState(origin, encrypted);

    response.result = get(state, key);
  } catch (error) {
    return end(error);
  }

  return end();
}

/**
 * Validate the parameters of the `snap_getState` method.
 *
 * @param params - The parameters to validate.
 * @returns The validated parameters.
 */
function getValidatedParams(params?: unknown) {
  try {
    return create(params, GetStateParametersStruct);
  } catch (error) {
    if (error instanceof StructError) {
      throw rpcErrors.invalidParams({
        message: `Invalid params: ${error.message}.`,
      });
    }

    throw error;
  }
}

/**
 * Get the value of a key in an object. The key may contain Lodash-style path
 * syntax, e.g., `a.b.c` (with the exception of array syntax). If the key does
 * not exist, `null` is returned.
 *
 * This is a simplified version of Lodash's `get` function, but Lodash doesn't
 * seem to be maintained anymore, so we're using our own implementation.
 *
 * @param value - The object to get the key from.
 * @param key - The key to get.
 * @returns The value of the key in the object, or `null` if the key does not
 * exist.
 */
export function get(
  value: Record<string, Json> | null,
  key?: string | undefined,
): Json {
  if (key === undefined || key === '') {
    return value;
  }

  const keys = key.split('.');
  let result: Json = value;

  for (const currentKey of keys) {
    if (['__proto__', 'constructor'].includes(currentKey)) {
      throw rpcErrors.invalidParams(
        'Invalid params: Key contains forbidden characters.',
      );
    }

    if (isPlainObject(result)) {
      if (!hasProperty(result, currentKey)) {
        return null;
      }

      result = result[currentKey];
      continue;
    }

    return null;
  }

  return result;
}
