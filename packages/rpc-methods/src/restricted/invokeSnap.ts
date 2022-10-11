import {
  PermissionSpecificationBuilder,
  RestrictedMethodOptions,
  ValidPermissionSpecification,
  PermissionType,
} from '@metamask/controllers';
import { isJsonRpcRequest, Json, NonEmptyArray } from '@metamask/utils';
import { ethErrors } from 'eth-rpc-errors';
import {
  Snap,
  SNAP_PREFIX,
  SnapId,
  HandlerType,
  SnapRpcHookArgs,
} from '@metamask/snap-utils';
import { nanoid } from 'nanoid';

const methodPrefix = SNAP_PREFIX;
const targetKey = `${methodPrefix}*` as const;

export type InvokeSnapMethodHooks = {
  getSnap: (snapId: SnapId) => Snap | undefined;
  handleSnapRpcRequest: ({
    snapId,
    origin,
    handler: handlerType,
    request,
  }: SnapRpcHookArgs & { snapId: SnapId }) => Promise<unknown>;
};

type InvokeSnapSpecificationBuilderOptions = {
  allowedCaveats?: Readonly<NonEmptyArray<string>> | null;
  methodHooks: InvokeSnapMethodHooks;
};

type InvokeSnapSpecification = ValidPermissionSpecification<{
  permissionType: PermissionType.RestrictedMethod;
  targetKey: typeof targetKey;
  methodImplementation: ReturnType<typeof getInvokeSnapImplementation>;
  allowedCaveats: Readonly<NonEmptyArray<string>> | null;
}>;

/**
 * The specification builder for the `wallet_snap_*` permission.
 *
 * `wallet_snap_*` attempts to invoke an RPC method of the specified Snap.
 *
 * Requesting its corresponding permission will attempt to connect to the Snap,
 * and install it if it's not avaialble yet.
 *
 * @param options - The specification builder options.
 * @param options.allowedCaveats - The optional allowed caveats for the permission.
 * @param options.methodHooks - The RPC method hooks needed by the method implementation.
 * @returns The specification for the `wallet_snap_*` permission.
 */
const specificationBuilder: PermissionSpecificationBuilder<
  PermissionType.RestrictedMethod,
  InvokeSnapSpecificationBuilderOptions,
  InvokeSnapSpecification
> = ({
  allowedCaveats = null,
  methodHooks,
}: InvokeSnapSpecificationBuilderOptions) => {
  return {
    permissionType: PermissionType.RestrictedMethod,
    targetKey,
    allowedCaveats,
    methodImplementation: getInvokeSnapImplementation(methodHooks),
  };
};

export const invokeSnapBuilder = Object.freeze({
  targetKey,
  specificationBuilder,
  methodHooks: {
    getSnap: true,
    handleSnapRpcRequest: true,
  },
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
    options: RestrictedMethodOptions<[Record<string, Json>]>,
  ): Promise<Json> {
    const { params = [], method, context } = options;
    const rawRequest = params[0];

    const request = { jsonrpc: '2.0', id: nanoid(), ...rawRequest };

    if (!isJsonRpcRequest(request)) {
      throw ethErrors.rpc.invalidParams({
        message:
          'Must specify a valid JSON-RPC request object as single parameter.',
      });
    }

    const snapId = method.slice(SNAP_PREFIX.length);

    if (!getSnap(snapId)) {
      throw ethErrors.rpc.invalidRequest({
        message: `The snap "${snapId}" is not installed. This is a bug, please report it.`,
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
