import type {
  JsonRpcEngineEndCallback,
  MethodHandler,
} from '@metamask/json-rpc-engine';
import type { Messenger } from '@metamask/messenger';
import type { PermissionControllerHasPermissionAction } from '@metamask/permission-controller';
import { providerErrors, rpcErrors } from '@metamask/rpc-errors';
import type {
  SetStateParams,
  SetStateResult,
  SnapId,
} from '@metamask/snaps-sdk';
import type { JsonObject } from '@metamask/snaps-sdk/jsx';
import { getJsonSizeUnsafe, type InferMatching } from '@metamask/snaps-utils';
import {
  boolean,
  create,
  object as objectStruct,
  optional,
  StructError,
} from '@metamask/superstruct';
import type { PendingJsonRpcResponse, Json } from '@metamask/utils';
import { hasProperty, isObject, assert, JsonStruct } from '@metamask/utils';
import { Mutex } from 'async-mutex';

import {
  manageStateBuilder,
  STORAGE_SIZE_LIMIT,
} from '../restricted/manageState';
import type {
  JsonRpcRequestWithOrigin,
  SnapControllerGetSnapAction,
  SnapControllerGetSnapStateAction,
  SnapControllerUpdateSnapStateAction,
} from '../types';
import type { MethodHooksObject } from '../utils';
import { FORBIDDEN_KEYS, StateKeyStruct } from '../utils';

const hookNames: MethodHooksObject<SetStateMethodHooks> = {
  getUnlockPromise: true,
};

export type SetStateMethodHooks = {
  /**
   * Wait for the extension to be unlocked.
   *
   * @returns A promise that resolves once the extension is unlocked.
   */
  getUnlockPromise: (shouldShowUnlockRequest: boolean) => Promise<void>;
};

export type SetStateMethodActions =
  | PermissionControllerHasPermissionAction
  | SnapControllerGetSnapStateAction
  | SnapControllerUpdateSnapStateAction
  | SnapControllerGetSnapAction;

/**
 * Allow the Snap to persist up to 64 MB of data to disk and retrieve it at
 * will. By default, the data is automatically encrypted using a Snap-specific
 * key and automatically decrypted when retrieved. You can set `encrypted` to
 * `false` to use unencrypted storage (available when the client is locked).
 *
 * If the key is `undefined`, the value is expected to be an object. In this
 * case, the value is set as the new root state.
 *
 * If the key is not `undefined`, the value is set in the state at the key. If
 * the key does not exist, it is created (and any missing intermediate keys are
 * created as well).
 *
 * @example
 * ```json name="Manifest"
 * {
 *   "initialPermissions": {
 *     "snap_manageState": {}
 *   }
 * }
 * ```
 * ```ts name="Usage"
 * // Set the entire state:
 * await snap.request({
 *   method: 'snap_setState',
 *   params: {
 *     value: {
 *       some: {
 *         nested: {
 *           value: 'Hello, world!',
 *         },
 *       },
 *     },
 *     encrypted: true, // Optional, defaults to `true`
 *   },
 * });
 *
 * // Set a specific value within the state:
 * await snap.request({
 *   method: 'snap_setState',
 *   params: {
 *     key: 'some.nested.value',
 *     value: 'Hello, world!',
 *     encrypted: true, // Optional, defaults to `true`
 *   },
 * });
 * ```
 */
export const setStateHandler = {
  implementation: setStateImplementation,
  hookNames,
  actionNames: [
    'PermissionController:hasPermission',
    'SnapController:getSnapState',
    'SnapController:updateSnapState',
    'SnapController:getSnap',
  ],
} satisfies MethodHandler<
  SetStateMethodHooks,
  SetStateMethodActions,
  SetStateParameters,
  SetStateResult,
  { origin: SnapId }
>;

const mutexes = new Map();

/**
 * Get the corresponding state modification mutex for a given Snap ID.
 *
 * @param snapId - The Snap ID.
 * @returns A mutex for that specific Snap.
 */
function getMutex(snapId: SnapId) {
  if (!mutexes.has(snapId)) {
    mutexes.set(snapId, new Mutex());
  }
  return mutexes.get(snapId);
}

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
 * @param hooks.getUnlockPromise - Wait for the extension to be unlocked.
 * @param messenger - The messenger used to call controller actions.
 * @returns Nothing.
 */
async function setStateImplementation(
  request: JsonRpcRequestWithOrigin<SetStateParameters>,
  response: PendingJsonRpcResponse<SetStateResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  { getUnlockPromise }: SetStateMethodHooks,
  messenger: Messenger<string, SetStateMethodActions>,
): Promise<void> {
  const { params, origin } = request;

  if (
    !messenger.call(
      'PermissionController:hasPermission',
      origin,
      manageStateBuilder.targetName,
    )
  ) {
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

    const snapId = origin as SnapId;

    const mutex = getMutex(snapId);

    // The expectation when using `snap_setState` is for the operation to safe
    // to do in parallel. The mutex ensures that and prevents a bug that was
    // mostly prevalent on mobile and caused data loss.
    await mutex.runExclusive(async () => {
      const newState = await getNewState(
        snapId,
        key,
        value,
        encrypted,
        messenger,
      );

      const snap = messenger.call('SnapController:getSnap', origin);

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

      await messenger.call(
        'SnapController:updateSnapState',
        origin,
        newState,
        encrypted,
      );
      response.result = null;
    });
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
 * @param snapId - The Snap ID.
 * @param key - The key to set.
 * @param value - The value to set the key to.
 * @param encrypted - Whether the state is encrypted.
 * @param messenger - The messenger used to call controller actions.
 * @returns The new state of the Snap.
 */
async function getNewState(
  snapId: SnapId,
  key: string | undefined,
  value: Json,
  encrypted: boolean,
  messenger: Messenger<string, SetStateMethodActions>,
): Promise<Record<string, Json>> {
  if (key === undefined) {
    assert(isObject(value));
    return value;
  }

  const state = await messenger.call(
    'SnapController:getSnapState',
    snapId,
    encrypted,
  );
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
    if (FORBIDDEN_KEYS.includes(currentKey)) {
      throw rpcErrors.invalidParams(
        'Invalid params: Key contains forbidden characters.',
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
