import type { JsonRpcEngineEndCallback } from '@metamask/json-rpc-engine';
import type { PermittedHandlerExport } from '@metamask/permission-controller';
import { rpcErrors } from '@metamask/rpc-errors';
import type {
  GetInterfaceContextParams,
  GetInterfaceContextResult,
  InterfaceContext,
  JsonRpcRequest,
} from '@metamask/snaps-sdk';
import { type InferMatching } from '@metamask/snaps-utils';
import { StructError, create, object, string } from '@metamask/superstruct';
import type { PendingJsonRpcResponse } from '@metamask/utils';

import type { MethodHooksObject } from '../utils';

const methodName = 'snap_getInterfaceContext';

const hookNames: MethodHooksObject<GetInterfaceContextMethodHooks> = {
  getInterfaceContext: true,
};

export type GetInterfaceContextMethodHooks = {
  /**
   * @param id - The interface ID.
   * @returns The interface context.
   */
  getInterfaceContext: (id: string) => InterfaceContext | null;
};

export const getInterfaceContextHandler = {
  methodNames: [methodName] as const,
  implementation: getInterfaceContextImplementation,
  hookNames,
} satisfies PermittedHandlerExport<
  GetInterfaceContextMethodHooks,
  GetInterfaceContextParameters,
  GetInterfaceContextResult
>;

const GetInterfaceContextParametersStruct = object({
  id: string(),
});

export type GetInterfaceContextParameters = InferMatching<
  typeof GetInterfaceContextParametersStruct,
  GetInterfaceContextParams
>;

/**
 * The `snap_getInterfaceContext` method implementation.
 *
 * @param req - The JSON-RPC request object.
 * @param res - The JSON-RPC response object.
 * @param _next - The `json-rpc-engine` "next" callback. Not used by this
 * function.
 * @param end - The `json-rpc-engine` "end" callback.
 * @param hooks - The RPC method hooks.
 * @param hooks.getInterfaceContext - The function to get the interface context.
 * @returns Noting.
 */
function getInterfaceContextImplementation(
  req: JsonRpcRequest<GetInterfaceContextParameters>,
  res: PendingJsonRpcResponse<GetInterfaceContextResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  { getInterfaceContext }: GetInterfaceContextMethodHooks,
): void {
  const { params } = req;

  try {
    const validatedParams = getValidatedParams(params);

    const { id } = validatedParams;

    res.result = getInterfaceContext(id);
  } catch (error) {
    return end(error);
  }

  return end();
}

/**
 * Validate the getInterfaceContext method `params` and returns them cast to the correct
 * type. Throws if validation fails.
 *
 * @param params - The unvalidated params object from the method request.
 * @returns The validated getInterfaceContext method parameter object.
 */
function getValidatedParams(params: unknown): GetInterfaceContextParameters {
  try {
    return create(params, GetInterfaceContextParametersStruct);
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
