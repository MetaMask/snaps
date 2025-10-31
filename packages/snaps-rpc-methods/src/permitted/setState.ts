import type { JsonRpcEngineEndCallback } from '@metamask/json-rpc-engine';
import type { PermittedHandlerExport } from '@metamask/permission-controller';
import { providerErrors, rpcErrors } from '@metamask/rpc-errors';
import type { SetStateParams, SetStateResult } from '@metamask/snaps-sdk';
import type { JsonObject } from '@metamask/snaps-sdk/jsx';
import {
  getJsonSizeUnsafe,
  type InferMatching,
  type Snap,
} from '@metamask/snaps-utils';
import {
  boolean,
  create,
  object as objectStruct,
  optional,
  StructError,
} from '@metamask/superstruct';
import type {
  PendingJsonRpcResponse,
  Json,
  JsonRpcRequest,
} from '@metamask/utils';
import { hasProperty, isObject, assert, JsonStruct } from '@metamask/utils';

import {
  manageStateBuilder,
  STORAGE_SIZE_LIMIT,
} from '../restricted/manageState';
import type { MethodHooksObject } from '../utils';
import { FORBIDDEN_KEYS, StateKeyStruct } from '../utils';

const hookNames: MethodHooksObject<SetStateHooks> = {
  hasPermission: true,
  getSnapState: true,
  getUnlockPromise: true,
  updateSnapState: true,
  getSnap: true,
};

/**
 * `snap_setState` sets the state of the Snap.
 */
export const setStateHandler: PermittedHandlerExport<
  SetStateHooks,
  SetStateParameters,
  SetStateResult
> = {
  methodNames: ['snap_setState'],
  implementation: setStateImplementation,
  hookNames,
};

export type SetStateHooks = {
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
   * @param encrypted - Whether the state is encrypted.
   * @returns The current state of the Snap.
   */
  getSnapState: (encrypted: boolean) => Promise<Record<string, Json>>;

  /**
   * Wait for the extension to be unlocked.
   *
   * @returns A promise that resolves once the extension is unlocked.
   */
  getUnlockPromise: (shouldShowUnlockRequest: boolean) => Promise<void>;

  /**
   * Update the state of the requesting Snap.
   *
   * @param newState - The new state of the Snap.
   * @param encrypted - Whether the state should be encrypted.
   */
  updateSnapState: (
    newState: Record<string, Json>,
    encrypted: boolean,
  ) => Promise<void>;

  /**
   * Get Snap metadata.
   *
   * @param snapId - The ID of a Snap.
   */
  getSnap: (snapId: string) => Snap | undefined;
};

const SetStateParametersStruct = objectStruct({
  key: optional(StateKeyStruct),
  value: JsonStruct,
  encrypted: optional(boolean()),
});

export type SetStateParameters = InferMatching<
  typeof SetStateParametersStruct,
  SetStateParams
>;

/**
 * The `snap_setState` method implementation.
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
 * @param hooks.updateSnapState - Update the state of the requesting Snap.
 * @param hooks.getSnap - The hook function to get Snap metadata.
 * @returns Nothing.
 */
async function setStateImplementation(
  request: JsonRpcRequest<SetStateParameters>,
  response: PendingJsonRpcResponse<SetStateResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  {
    hasPermission,
    getSnapState,
    getUnlockPromise,
    updateSnapState,
    getSnap,
  }: SetStateHooks,
): Promise<void> {
  const { params } = request;

  if (!hasPermission(manageStateBuilder.targetName)) {
    return end(providerErrors.unauthorized());
  }

  try {
    const validatedParams = getValidatedParams(params);
    const { key, value, encrypted = true } = validatedParams;

    if (key === undefined && !isObject(value)) {
      return end(
        rpcErrors.invalidParams(
          'Invalid params: Value must be an object if key is not provided.',
        ),
      );
    }

    if (encrypted) {
      await getUnlockPromise(true);
    }

    const newState = await getNewState(key, value, encrypted, getSnapState);

    const snap = getSnap(
      (request as JsonRpcRequest<SetStateParams> & { origin: string }).origin,
    );

    if (!snap?.preinstalled) {
      // We know that the state is valid JSON as per previous validation.
      const size = getJsonSizeUnsafe(newState, true);
      if (size > STORAGE_SIZE_LIMIT) {
        throw rpcErrors.invalidParams({
          message: `Invalid params: The new state must not exceed ${
            STORAGE_SIZE_LIMIT / 1_000_000
          } MB in size.`,
        });
      }
    }

    await updateSnapState(newState, encrypted);
    response.result = null;
  } catch (error) {
    return end(error);
  }

  return end();
}

/**
 * Validate the parameters of the `snap_setState` method.
 *
 * @param params - The parameters to validate.
 * @returns The validated parameters.
 */
function getValidatedParams(params?: unknown) {
  try {
    return create(params, SetStateParametersStruct);
  } catch (error) {
    if (error instanceof StructError) {
      throw rpcErrors.invalidParams({
        message: `Invalid params: ${error.message}.`,
      });
    }

    /* istanbul ignore next */
    throw rpcErrors.internal();
  }
}

/**
 * Get the new state of the Snap.
 *
 * If the key is `undefined`, the value is expected to be an object. In this
 * case, the value is returned as the new state.
 *
 * If the key is not `undefined`, the value is set in the state at the key. If
 * the key does not exist, it is created (and any missing intermediate keys are
 * created as well).
 *
 * @param key - The key to set.
 * @param value - The value to set the key to.
 * @param encrypted - Whether the state is encrypted.
 * @param getSnapState - The `getSnapState` hook.
 * @returns The new state of the Snap.
 */
async function getNewState(
  key: string | undefined,
  value: Json,
  encrypted: boolean,
  getSnapState: SetStateHooks['getSnapState'],
) {
  if (key === undefined) {
    assert(isObject(value));
    return value;
  }

  const state = await getSnapState(encrypted);
  return set(state, key, value);
}

/**
 * Set the value of a key in an object. The key may contain Lodash-style path
 * syntax, e.g., `a.b.c` (with the exception of array syntax). If the key does
 * not exist, it is created (and any missing intermediate keys are created as
 * well).
 *
 * This is a simplified version of Lodash's `set` function, but Lodash doesn't
 * seem to be maintained anymore, so we're using our own implementation.
 *
 * @param object - The object to get the key from.
 * @param key - The key to set.
 * @param value - The value to set the key to.
 * @returns The new object with the key set to the value.
 */
export function set(
  object: Record<string, Json> | null,
  key: string,
  value: Json,
): JsonObject {
  const keys = key.split('.');
  const requiredObject = object ?? {};
  let currentObject: Record<string, Json> = requiredObject;

  for (let i = 0; i < keys.length; i++) {
    const currentKey = keys[i];
    // Explicitly block prototype pollution keys
    if (
      FORBIDDEN_KEYS.includes(currentKey) ||
      currentKey === '__proto__' ||
      currentKey === 'constructor' ||
      currentKey === 'prototype'
    ) {
      throw rpcErrors.invalidParams(
        'Invalid params: Key contains forbidden characters or is potentially prototype polluting.',
      );
    }

    if (i === keys.length - 1) {
      currentObject[currentKey] = value;
      return requiredObject;
    }

    if (
      !hasProperty(currentObject, currentKey) ||
      currentObject[currentKey] === null
    ) {
      currentObject[currentKey] = {};
    } else if (!isObject(currentObject[currentKey])) {
      throw rpcErrors.invalidParams(
        'Invalid params: Cannot overwrite non-object value.',
      );
    }

    currentObject = currentObject[currentKey] as Record<string, Json>;
  }

  // This should never be reached.
  /* istanbul ignore next */
  throw new Error('Unexpected error while setting the state.');
}
