import type {
  PermissionSpecificationBuilder,
  RestrictedMethodOptions,
  ValidPermissionSpecification,
  PermissionValidatorConstraint,
  PermissionSideEffect,
} from '@metamask/permission-controller';
import { PermissionType } from '@metamask/permission-controller';
import type {
  Snap,
  SnapId,
  SnapRpcHookArgs,
  RequestedSnapPermissions,
  InstallSnapsResult,
} from '@metamask/snaps-utils';
import { HandlerType, SnapCaveatType } from '@metamask/snaps-utils';
import type { Json, NonEmptyArray } from '@metamask/utils';
import { ethErrors } from 'eth-rpc-errors';

import type { MethodHooksObject } from '../utils';

export const WALLET_SNAP_PERMISSION_KEY = 'wallet_snap';

// Redeclare installSnaps action type to avoid circular dependencies
export type InstallSnaps = {
  type: `SnapController:install`;
  handler: (
    origin: string,
    requestedSnaps: RequestedSnapPermissions,
  ) => Promise<InstallSnapsResult>;
};

export type GetPermittedSnaps = {
  type: `SnapController:getPermitted`;
  handler: (origin: string) => InstallSnapsResult;
};

type AllowedActions = InstallSnaps | GetPermittedSnaps;

export type InvokeSnapMethodHooks = {
  getSnap: (snapId: SnapId) => Snap | undefined;
  handleSnapRpcRequest: ({
    snapId,
    origin,
    handler,
    request,
  }: SnapRpcHookArgs & { snapId: SnapId }) => Promise<unknown>;
};

type InvokeSnapSpecificationBuilderOptions = {
  allowedCaveats?: Readonly<NonEmptyArray<string>> | null;
  methodHooks: InvokeSnapMethodHooks;
};

type InvokeSnapSpecification = ValidPermissionSpecification<{
  permissionType: PermissionType.RestrictedMethod;
  targetName: typeof WALLET_SNAP_PERMISSION_KEY;
  methodImplementation: ReturnType<typeof getInvokeSnapImplementation>;
  allowedCaveats: Readonly<NonEmptyArray<string>> | null;
  validator: PermissionValidatorConstraint;
  sideEffect: {
    onPermitted: PermissionSideEffect<AllowedActions, never>['onPermitted'];
  };
}>;

export type InvokeSnapParams = {
  snapId: string;
  request: Record<string, unknown>;
};

/**
 * The side-effect method to handle the snap install.
 *
 * @param params - The side-effect params.
 * @param params.requestData - The request data associated to the requested permission.
 * @param params.messagingSystem - The messenger to call an action.
 */
export const handleSnapInstall: PermissionSideEffect<
  AllowedActions,
  never
>['onPermitted'] = async ({ requestData, messagingSystem }) => {
  const snaps = requestData.permissions[WALLET_SNAP_PERMISSION_KEY].caveats?.[0]
    .value as RequestedSnapPermissions;

  const permittedSnaps = messagingSystem.call(
    `SnapController:getPermitted`,
    requestData.metadata.origin,
  );

  const dedupedSnaps = Object.keys(snaps).reduce<RequestedSnapPermissions>(
    (filteredSnaps, snap) => {
      if (!permittedSnaps[snap]) {
        filteredSnaps[snap] = snaps[snap];
      }
      return filteredSnaps;
    },
    {},
  );

  return messagingSystem.call(
    `SnapController:install`,
    requestData.metadata.origin,
    dedupedSnaps,
  );
};
/**
 * The specification builder for the `wallet_snap_*` permission.
 *
 * `wallet_snap_*` attempts to invoke an RPC method of the specified Snap.
 *
 * Requesting its corresponding permission will attempt to connect to the Snap,
 * and install it if it's not available yet.
 *
 * @param options - The specification builder options.
 * @param options.methodHooks - The RPC method hooks needed by the method implementation.
 * @returns The specification for the `wallet_snap_*` permission.
 */
const specificationBuilder: PermissionSpecificationBuilder<
  PermissionType.RestrictedMethod,
  InvokeSnapSpecificationBuilderOptions,
  InvokeSnapSpecification
> = ({ methodHooks }: InvokeSnapSpecificationBuilderOptions) => {
  return {
    permissionType: PermissionType.RestrictedMethod,
    targetName: WALLET_SNAP_PERMISSION_KEY,
    allowedCaveats: [SnapCaveatType.SnapIds],
    methodImplementation: getInvokeSnapImplementation(methodHooks),
    validator: ({ caveats }) => {
      if (caveats?.length !== 1 || caveats[0].type !== SnapCaveatType.SnapIds) {
        throw ethErrors.rpc.invalidParams({
          message: `Expected a single "${SnapCaveatType.SnapIds}" caveat.`,
        });
      }
    },
    sideEffect: {
      onPermitted: handleSnapInstall,
    },
  };
};

const methodHooks: MethodHooksObject<InvokeSnapMethodHooks> = {
  getSnap: true,
  handleSnapRpcRequest: true,
};

export const invokeSnapBuilder = Object.freeze({
  targetName: WALLET_SNAP_PERMISSION_KEY,
  specificationBuilder,
  methodHooks,
} as const);

/**
 * Builds the method implementation for `wallet_snap_*`.
 *
 * @param hooks - The RPC method hooks.
 * @param hooks.getSnap - A function that retrieves all information stored about a snap.
 * @param hooks.handleSnapRpcRequest - A function that sends an RPC request to a snap's RPC handler or throws if that fails.
 * @returns The method implementation which returns the result of `handleSnapRpcRequest`.
 * @throws If the params are invalid.
 */
export function getInvokeSnapImplementation({
  getSnap,
  handleSnapRpcRequest,
}: InvokeSnapMethodHooks) {
  return async function invokeSnap(
    options: RestrictedMethodOptions<Record<string, Json>>,
  ): Promise<Json> {
    const { params = {}, context } = options;

    const { snapId, request } = params as InvokeSnapParams;

    if (!getSnap(snapId)) {
      throw ethErrors.rpc.invalidRequest({
        message: `The snap "${snapId}" is not installed. Please install it first, before invoking the snap.`,
      });
    }

    const { origin } = context;

    return (await handleSnapRpcRequest({
      snapId,
      origin,
      request,
      handler: HandlerType.OnRpcRequest,
    })) as Json;
  };
}
