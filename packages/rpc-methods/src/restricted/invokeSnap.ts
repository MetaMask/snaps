import {
  PermissionSpecificationBuilder,
  RestrictedMethodOptions,
  ValidPermissionSpecification,
  PermissionType,
} from '@metamask/controllers';
import { SNAP_PREFIX, SnapController } from '@metamask/snap-controllers';
import { isObject, Json, NonEmptyArray } from '@metamask/utils';
import { ethErrors } from 'eth-rpc-errors';

const methodPrefix = SNAP_PREFIX;
const targetKey = `${methodPrefix}*` as const;

export type InvokeSnapMethodHooks = {
  getSnap: SnapController['get'];
  handleSnapRpcRequest: SnapController['handleRpcRequest'];
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
 * `wallet_snap_*` attempts to invoke an RPC method of the specified Snap.
 * Requesting its corresponding permission will attempt to connect to the Snap,
 * and install it if it's not avaialble yet.
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

function getInvokeSnapImplementation({
  getSnap,
  handleSnapRpcRequest,
}: InvokeSnapMethodHooks) {
  return async function invokeSnap(
    options: RestrictedMethodOptions<[Record<string, Json>]>,
  ): Promise<Json> {
    const { params = [], method, context } = options;
    const snapRpcRequest = params[0];

    if (!isObject(snapRpcRequest)) {
      throw ethErrors.rpc.invalidParams({
        message: 'Must specify snap RPC request object as single parameter.',
      });
    }

    const snapIdString = method.substr(SNAP_PREFIX.length);

    if (!getSnap(snapIdString)) {
      throw ethErrors.rpc.invalidRequest({
        message: `The snap "${snapIdString}" is not installed. This is a bug, please report it.`,
      });
    }

    const fromSubject = context.origin;

    // handleSnapRpcRequest is an async function that takes the snap id, a snapOriginString string and a request object.
    // It should return the result it would like returned to the fromDomain as part of response.result
    return (await handleSnapRpcRequest(
      snapIdString,
      fromSubject,
      snapRpcRequest,
    )) as Json;
  };
}
