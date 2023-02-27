import {
  PermissionSpecificationBuilder,
  RestrictedMethodOptions,
  ValidPermissionSpecification,
  PermissionType,
  RestrictedMethodCaveatSpecificationConstraint,
  Caveat,
  RestrictedMethodParameters,
  PermissionValidatorConstraint,
} from '@metamask/permission-controller';
import {
  Snap,
  SnapId,
  HandlerType,
  SnapRpcHookArgs,
  SnapCaveatType,
  assertIsValidSnapId,
} from '@metamask/snaps-utils';
import {
  isJsonRpcRequest,
  Json,
  NonEmptyArray,
  hasProperty,
  isObject,
} from '@metamask/utils';
import { ethErrors } from 'eth-rpc-errors';
import { nanoid } from 'nanoid';

export const WALLET_SNAP_PERMISSION_KEY = 'wallet_snap';

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
  targetKey: typeof WALLET_SNAP_PERMISSION_KEY;
  methodImplementation: ReturnType<typeof getInvokeSnapImplementation>;
  allowedCaveats: Readonly<NonEmptyArray<string>> | null;
  validator: PermissionValidatorConstraint;
}>;

type InvokeSnapParams = {
  snapId: string;
  request: Record<string, unknown>;
};

/**
 * Validates that the caveat value exists and is a non-empty object.
 *
 * @param caveat - The caveat to validate.
 * @throws If the caveat is invalid.
 */
export function validateCaveat(caveat: Caveat<string, any>) {
  if (!isObject(caveat.value) || Object.keys(caveat.value).length === 0) {
    throw ethErrors.rpc.invalidParams({
      message:
        'Expected caveat to have a value property of a non-empty object of snap IDs.',
    });
  }
  const snapIds = Object.keys(caveat.value);
  for (const snapId of snapIds) {
    assertIsValidSnapId(snapId);
  }
}

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
    targetKey: WALLET_SNAP_PERMISSION_KEY,
    allowedCaveats: [SnapCaveatType.SnapIds],
    methodImplementation: getInvokeSnapImplementation(methodHooks),
    validator: ({ caveats }) => {
      if (caveats?.length !== 1 || caveats[0].type !== SnapCaveatType.SnapIds) {
        throw ethErrors.rpc.invalidParams({
          message: `Expected a single "${SnapCaveatType.SnapIds}" caveat.`,
        });
      }
    },
  };
};

export const invokeSnapBuilder = Object.freeze({
  targetKey: WALLET_SNAP_PERMISSION_KEY,
  specificationBuilder,
  methodHooks: {
    getSnap: true,
    handleSnapRpcRequest: true,
  },
} as const);

export const InvokeSnapCaveatSpecifications: Record<
  SnapCaveatType.SnapIds,
  RestrictedMethodCaveatSpecificationConstraint
> = {
  [SnapCaveatType.SnapIds]: Object.freeze({
    type: SnapCaveatType.SnapIds,
    validator: (caveat) => validateCaveat(caveat),
    decorator: (method, caveat) => {
      return async (args) => {
        const {
          params,
          context: { origin },
        }: RestrictedMethodOptions<RestrictedMethodParameters> = args;
        const snapIds = caveat.value;
        const { snapId } = params as InvokeSnapParams;
        if (!hasProperty(snapIds, snapId)) {
          throw new Error(
            `${origin} does not have permission to invoke ${snapId} snap.`,
          );
        }
        return await method(args);
      };
    },
  }),
};

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

    const rpcRequest = {
      jsonrpc: '2.0',
      id: nanoid(),
      ...request,
    };

    if (!isJsonRpcRequest(rpcRequest)) {
      throw ethErrors.rpc.invalidParams({
        message:
          'Must specify a valid JSON-RPC request object as single parameter.',
      });
    }

    if (!getSnap(snapId)) {
      throw ethErrors.rpc.invalidRequest({
        message: `The snap "${snapId}" is not installed. This is a bug, please report it.`,
      });
    }

    const { origin } = context;

    return (await handleSnapRpcRequest({
      snapId,
      origin,
      request: rpcRequest,
      handler: HandlerType.OnRpcRequest,
    })) as Json;
  };
}
