import { Json } from 'json-rpc-engine';
import {
  PermissionSpecificationBuilder,
  RestrictedMethodOptions,
  ValidPermissionSpecification,
  SNAP_PREFIX,
  SnapController,
} from '@metamask/snap-controllers';
import { ethErrors } from 'eth-rpc-errors';

import { NonEmptyArray } from '@metamask/snap-controllers/src/utils';
import { isPlainObject } from '../utils';

const methodPrefix = SNAP_PREFIX;
const targetKey = `${methodPrefix}*` as const;

export type InvokeSnapMethodHooks = {
  getSnap: SnapController['get'];
  addSnap: SnapController['add'];
  getSnapRpcHandler: SnapController['getRpcMessageHandler'];
};

type InvokeSnapSpecificationBuilderOptions = {
  allowedCaveats?: Readonly<NonEmptyArray<string>> | null;
  methodHooks: InvokeSnapMethodHooks;
};

type InvokeSnapSpecification = ValidPermissionSpecification<{
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
  InvokeSnapSpecificationBuilderOptions,
  InvokeSnapSpecification
> = ({
  allowedCaveats = null,
  methodHooks,
}: InvokeSnapSpecificationBuilderOptions) => {
  return {
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
    addSnap: true,
    getSnapRpcHandler: true,
  },
} as const);

function getInvokeSnapImplementation({
  getSnap,
  addSnap,
  getSnapRpcHandler,
}: InvokeSnapMethodHooks) {
  return async function invokeSnap(
    options: RestrictedMethodOptions<[Record<string, Json>]>,
  ): Promise<Json> {
    const { params = [], method, context } = options;
    const snapRpcRequest = params[0];

    if (!isPlainObject(snapRpcRequest)) {
      throw ethErrors.rpc.invalidParams({
        message: 'Must specify snap RPC request object as single parameter.',
      });
    }

    const snapOriginString = method.substr(SNAP_PREFIX.length);

    if (!getSnap(snapOriginString)) {
      await addSnap({
        name: snapOriginString,
        manifestUrl: snapOriginString,
      });
    }

    const handler = await getSnapRpcHandler(snapOriginString);
    if (!handler) {
      throw ethErrors.rpc.methodNotFound({
        message: `Snap RPC message handler not found for snap "${snapOriginString}".`,
      });
    }

    const fromSubject = context.origin;

    // Handler is an async function that takes an snapOriginString string and a request object.
    // It should return the result it would like returned to the fromDomain as part of response.result
    return (await handler(fromSubject, snapRpcRequest)) as Json;
  };
}
