import type {
  JsonRpcEngineEndCallback,
  MethodHandler,
} from '@metamask/json-rpc-engine';
import type { Messenger } from '@metamask/messenger';
import type {
  Caveat,
  PermissionConstraint,
  PermissionControllerGetPermissionsAction,
  PermissionControllerRequestPermissionsAction,
  RequestedPermissions,
} from '@metamask/permission-controller';
import { rpcErrors } from '@metamask/rpc-errors';
import type {
  RequestSnapsParams,
  RequestSnapsResult,
} from '@metamask/snaps-sdk';
import type { SnapsPermissionRequest } from '@metamask/snaps-utils';
import {
  SnapCaveatType,
  verifyRequestedSnapPermissions,
} from '@metamask/snaps-utils';
import type {
  JsonRpcRequest,
  PendingJsonRpcResponse,
  Json,
} from '@metamask/utils';
import { hasProperty, isObject } from '@metamask/utils';
import { Mutex } from 'async-mutex';

import { WALLET_SNAP_PERMISSION_KEY } from '../restricted/invokeSnap';
import type { SnapControllerInstallSnapsAction } from '../types';

export type RequestSnapsMethodActions =
  | SnapControllerInstallSnapsAction
  | PermissionControllerRequestPermissionsAction
  | PermissionControllerGetPermissionsAction;

/**
 * Request permission for a dapp to communicate with the specified Snaps and
 * attempt to install them if they're not already installed.
 *
 * If the Snap version range is specified, MetaMask attempts to install a
 * version of the Snap that satisfies the range. If a compatible version of the
 * Snap is already installed, the request succeeds. If an incompatible version
 * is installed, MetaMask attempts to update the Snap to the latest version that
 * satisfies the range. The request succeeds if the Snap is successfully
 * installed.
 *
 * If the installation of any Snap fails, or the user rejects the installation
 * or permission request, this method returns the error that caused the failure.
 *
 * @example
 * ```ts
 * const result = await snap.request({
 *   method: 'wallet_requestSnaps',
 *   params: {
 *     'npm:@metamask/example-snap': {},
 *     'npm:@metamask/another-snap': { version: '1.2.3' },
 *   },
 * });
 * ```
 */
export const requestSnapsHandler = {
  implementation: requestSnapsImplementation,
  actionNames: [
    'SnapController:installSnaps',
    'PermissionController:requestPermissions',
    'PermissionController:getPermissions',
  ],
} satisfies MethodHandler<
  never,
  RequestSnapsMethodActions,
  RequestSnapsParams,
  RequestSnapsResult,
  { origin: string }
>;

/**
 * Checks whether an origin has existing `wallet_snap` permission and
 * whether or not it has the requested snapIds caveat.
 *
 * @param existingPermissions - The existing permissions for the origin.
 * @param requestedSnaps - The requested snaps.
 * @returns True if the existing permissions satisfy the requested snaps, otherwise false.
 */
export function hasRequestedSnaps(
  existingPermissions: Record<string, PermissionConstraint>,
  requestedSnaps: Record<string, unknown>,
): boolean {
  const snapIdCaveat = existingPermissions[
    WALLET_SNAP_PERMISSION_KEY
  ]?.caveats?.find(
    (caveat: Caveat<string, Json>) => caveat.type === SnapCaveatType.SnapIds,
  );

  const permittedSnaps = snapIdCaveat?.value;
  if (isObject(permittedSnaps)) {
    return Object.keys(requestedSnaps).every((requestedSnap) =>
      hasProperty(permittedSnaps, requestedSnap),
    );
  }
  return false;
}

/**
 * Constructs a valid permission request with merged caveats based on existing permissions
 * and the requested snaps.
 *
 * @param existingPermissions - The existing permissions for the origin.
 * @param requestedPermissions - The permission request passed into `requestPermissions`.
 * @returns `requestedPermissions`.
 */
export function getSnapPermissionsRequest(
  existingPermissions: Record<string, PermissionConstraint>,
  requestedPermissions: unknown,
): SnapsPermissionRequest {
  verifyRequestedSnapPermissions(requestedPermissions);

  if (!existingPermissions[WALLET_SNAP_PERMISSION_KEY]) {
    return requestedPermissions;
  }

  const snapIdCaveat = existingPermissions[
    WALLET_SNAP_PERMISSION_KEY
  ].caveats?.find(
    (caveat: Caveat<string, Json>) => caveat.type === SnapCaveatType.SnapIds,
  );

  const permittedSnaps = (snapIdCaveat?.value as Record<string, Json>) ?? {};

  const requestedSnaps =
    requestedPermissions[WALLET_SNAP_PERMISSION_KEY].caveats[0].value;

  const snapIdSet = new Set([
    ...Object.keys(permittedSnaps),
    ...Object.keys(requestedSnaps),
  ]);

  const mergedCaveatValue = [...snapIdSet].reduce<Record<string, Json>>(
    (request, snapId) => {
      request[snapId] = requestedSnaps[snapId] ?? permittedSnaps[snapId];
      return request;
    },
    {},
  );

  requestedPermissions[WALLET_SNAP_PERMISSION_KEY].caveats[0].value =
    mergedCaveatValue;

  return requestedPermissions;
}

const mutexes = new Map();

/**
 * Get the corresponding Snap installation mutex for a given origin.
 *
 * @param origin - The origin of the request.
 * @returns A mutex for that specific origin.
 */
function getMutex(origin: string) {
  if (!mutexes.has(origin)) {
    mutexes.set(origin, new Mutex());
  }
  return mutexes.get(origin);
}

/**
 * The `wallet_requestSnaps` method implementation.
 * Tries to install the requested snaps and adds them to the JSON-RPC response.
 *
 * @param req - The JSON-RPC request object.
 * @param res - The JSON-RPC response object.
 * @param _next - The `json-rpc-engine` "next" callback. Not used by this
 * function.
 * @param end - The `json-rpc-engine` "end" callback.
 * @param _hooks - The RPC method hooks. Not used by this function.
 * @param messenger - The messenger used to call controller actions.
 * @returns A promise that resolves once the JSON-RPC response has been modified.
 * @throws If the params are invalid.
 */
async function requestSnapsImplementation(
  req: JsonRpcRequest<RequestSnapsParams> & { origin: string },
  res: PendingJsonRpcResponse<RequestSnapsResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  _hooks: Record<string, never>,
  messenger: Messenger<string, RequestSnapsMethodActions>,
): Promise<void> {
  const requestedSnaps = req.params;
  if (!isObject(requestedSnaps)) {
    return end(
      rpcErrors.invalidParams({
        message: '"params" must be an object.',
      }),
    );
  }

  if (Object.keys(requestedSnaps).length === 0) {
    return end(
      rpcErrors.invalidParams({
        message: 'Request must have at least one requested snap.',
      }),
    );
  }

  const { origin } = req;

  const mutex = getMutex(origin);

  // Process requests sequentially for each origin as permissions need to be merged
  // for every request.
  await mutex.runExclusive(async () => {
    try {
      const requestedPermissions = {
        [WALLET_SNAP_PERMISSION_KEY]: {
          caveats: [{ type: SnapCaveatType.SnapIds, value: requestedSnaps }],
        },
      } as RequestedPermissions;
      const existingPermissions = messenger.call(
        'PermissionController:getPermissions',
        origin,
      );

      if (!existingPermissions) {
        const [, metadata] = await messenger.call(
          'PermissionController:requestPermissions',
          { origin },
          requestedPermissions,
        );

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        res.result = metadata.data![
          WALLET_SNAP_PERMISSION_KEY
        ] as RequestSnapsResult;
      } else if (hasRequestedSnaps(existingPermissions, requestedSnaps)) {
        res.result = await messenger.call(
          'SnapController:installSnaps',
          origin,
          requestedSnaps,
        );
      } else {
        const mergedPermissionsRequest = getSnapPermissionsRequest(
          existingPermissions,
          requestedPermissions,
        );

        const [, metadata] = await messenger.call(
          'PermissionController:requestPermissions',
          { origin },
          mergedPermissionsRequest,
        );

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        res.result = metadata.data![
          WALLET_SNAP_PERMISSION_KEY
        ] as RequestSnapsResult;
      }
    } catch (error) {
      res.error = error;
    }
  });

  return end();
}
