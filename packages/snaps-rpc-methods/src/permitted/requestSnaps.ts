import type {
  PermissionConstraint,
  RequestedPermissions,
  Caveat,
} from '@metamask/permission-controller';
import type { SnapsPermissionRequest } from '@metamask/snaps-utils';
import {
  SnapCaveatType,
  verifyRequestedSnapPermissions,
} from '@metamask/snaps-utils';
import type {
  PermittedHandlerExport,
  JsonRpcRequest,
  PendingJsonRpcResponse,
  JsonRpcEngineEndCallback,
} from '@metamask/types';
import type { Json } from '@metamask/utils';
import { hasProperty, isObject } from '@metamask/utils';
import { ethErrors } from 'eth-rpc-errors';

import { WALLET_SNAP_PERMISSION_KEY } from '../restricted/invokeSnap';
import type { MethodHooksObject } from '../utils';
import type {
  InstallSnapsHook,
  InstallSnapsResult,
} from './common/snapInstallation';
import { handleInstallSnaps } from './common/snapInstallation';

const hookNames: MethodHooksObject<RequestSnapsHooks> = {
  installSnaps: true,
  requestPermissions: true,
  getPermissions: true,
};

/**
 * `wallet_requestSnaps` installs the requested Snaps and requests permission to use them if necessary.
 */
export const requestSnapsHandler: PermittedHandlerExport<
  RequestSnapsHooks,
  RequestedPermissions,
  InstallSnapsResult
> = {
  methodNames: ['wallet_requestSnaps'],
  implementation: requestSnapsImplementation,
  hookNames,
};

export type RequestSnapsHooks = {
  /**
   * Installs the requested snaps if they are permitted.
   */
  installSnaps: InstallSnapsHook;

  /**
   * Initiates a permission request for the requesting origin.
   *
   * @returns The result of the permissions request.
   */
  requestPermissions: (
    permissions: RequestedPermissions,
  ) => Promise<
    [
      Record<string, PermissionConstraint>,
      { data: Record<string, unknown>; id: string; origin: string },
    ]
  >;

  /**
   * Gets the current permissions for the requesting origin.
   *
   * @returns The current permissions of the requesting origin.
   */
  getPermissions: () => Promise<
    Record<string, PermissionConstraint> | undefined
  >;
};

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

/**
 * The `wallet_requestSnaps` method implementation.
 * Tries to install the requested snaps and adds them to the JSON-RPC response.
 *
 * @param req - The JSON-RPC request object.
 * @param res - The JSON-RPC response object.
 * @param _next - The `json-rpc-engine` "next" callback. Not used by this
 * function.
 * @param end - The `json-rpc-engine` "end" callback.
 * @param hooks - The RPC method hooks.
 * @param hooks.installSnaps - A function that tries to install a given snap, prompting the user if necessary.
 * @param hooks.requestPermissions - A function that requests permissions on
 * behalf of a subject.
 * @param hooks.getPermissions - A function that gets the current permissions.
 * @returns A promise that resolves once the JSON-RPC response has been modified.
 * @throws If the params are invalid.
 */
async function requestSnapsImplementation(
  req: JsonRpcRequest<RequestedPermissions>,
  res: PendingJsonRpcResponse<InstallSnapsResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  { installSnaps, requestPermissions, getPermissions }: RequestSnapsHooks,
): Promise<void> {
  const requestedSnaps = req.params;
  if (!isObject(requestedSnaps)) {
    return end(
      ethErrors.rpc.invalidParams({
        message: '"params" must be an object.',
      }),
    );
  }

  try {
    if (!Object.keys(requestedSnaps).length) {
      throw new Error('Request must have at least one requested snap.');
    }

    const requestedPermissions = {
      [WALLET_SNAP_PERMISSION_KEY]: {
        caveats: [{ type: SnapCaveatType.SnapIds, value: requestedSnaps }],
      },
    } as RequestedPermissions;
    const existingPermissions = await getPermissions();

    if (!existingPermissions) {
      const [, metadata] = await requestPermissions(requestedPermissions);
      res.result = metadata.data[
        WALLET_SNAP_PERMISSION_KEY
      ] as InstallSnapsResult;
    } else if (hasRequestedSnaps(existingPermissions, requestedSnaps)) {
      res.result = await handleInstallSnaps(requestedSnaps, installSnaps);
    } else {
      const mergedPermissionsRequest = getSnapPermissionsRequest(
        existingPermissions,
        requestedPermissions,
      );

      const [, metadata] = await requestPermissions(mergedPermissionsRequest);
      res.result = metadata.data[
        WALLET_SNAP_PERMISSION_KEY
      ] as InstallSnapsResult;
    }
  } catch (error) {
    res.error = error;
  }

  return end();
}
