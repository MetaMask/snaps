import {
  PermissionConstraint,
  RequestedPermissions,
  Caveat,
} from '@metamask/permission-controller';
import {
  SnapCaveatType,
  SnapsPermissionRequest,
  verifyRequestedSnapPermissions,
} from '@metamask/snaps-utils';
import {
  PermittedHandlerExport,
  JsonRpcRequest,
  PendingJsonRpcResponse,
  JsonRpcEngineEndCallback,
} from '@metamask/types';
import { hasProperty, isObject, Json } from '@metamask/utils';
import { ethErrors } from 'eth-rpc-errors';

import { WALLET_SNAP_PERMISSION_KEY } from '../restricted/invokeSnap';
import {
  handleInstallSnaps,
  InstallSnapsHook,
  InstallSnapsResult,
} from './common/snapInstallation';

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
  hookNames: {
    installSnaps: true,
    requestPermissions: true,
    getPermissions: true,
  },
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
  ) => Promise<PermissionConstraint[]>;

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

  const permittedSnaps = snapIdCaveat?.value ?? {};
  const snapIdSet = new Set(Object.keys(permittedSnaps));

  const requestedSnaps =
    requestedPermissions[WALLET_SNAP_PERMISSION_KEY].caveats[0].value;

  for (const requestedSnap of Object.keys(requestedSnaps)) {
    snapIdSet.add(requestedSnap);
  }

  const mergedCaveatValue = [...snapIdSet].reduce<Record<string, Json>>(
    (request, snapId) => {
      request[snapId] = {};
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

  // Request the permission for the installing DApp to talk to the snap, if needed
  // TODO: Should this be part of the install flow?

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

    let approvedPermissions = [];

    if (!existingPermissions) {
      approvedPermissions = await requestPermissions(requestedPermissions);
    } else if (!hasRequestedSnaps(existingPermissions, requestedSnaps)) {
      const mergedPermissionsRequest = getSnapPermissionsRequest(
        existingPermissions,
        requestedPermissions,
      );
      approvedPermissions = await requestPermissions(mergedPermissionsRequest);
    }

    if (
      (!existingPermissions ||
        !hasRequestedSnaps(existingPermissions, requestedSnaps)) &&
      !approvedPermissions?.length
    ) {
      throw ethErrors.provider.userRejectedRequest({ data: req });
    }
  } catch (error) {
    return end(error);
  }

  try {
    res.result = await handleInstallSnaps(requestedSnaps, installSnaps);
  } catch (error) {
    res.error = error;
  }
  return end();
}
