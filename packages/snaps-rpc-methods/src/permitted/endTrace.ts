import type { JsonRpcEngineEndCallback } from '@metamask/json-rpc-engine';
import type { PermittedHandlerExport } from '@metamask/permission-controller';
import { rpcErrors } from '@metamask/rpc-errors';
import type {
  JsonRpcRequest,
  EndTraceParams,
  EndTraceResult,
  EndTraceRequest,
} from '@metamask/snaps-sdk';
import type { InferMatching, Snap } from '@metamask/snaps-utils';
import {
  number,
  create,
  object,
  string,
  StructError,
  exactOptional,
} from '@metamask/superstruct';
import type { PendingJsonRpcResponse } from '@metamask/utils';

import type { MethodHooksObject } from '../utils';

const methodName = 'snap_endTrace';

const hookNames: MethodHooksObject<EndTraceMethodHooks> = {
  endTrace: true,
  getSnap: true,
};

export type EndTraceMethodHooks = {
  /**
   * End a performance trace in Sentry.
   *
   * @param request - The trace request object.
   * @returns The performance trace context.
   */
  endTrace: (request: EndTraceRequest) => void;

  /**
   * Get Snap metadata.
   *
   * @param snapId - The ID of a Snap.
   */
  getSnap: (snapId: string) => Snap | undefined;
};

const EndTraceParametersStruct = object({
  id: exactOptional(string()),
  name: string(),
  timestamp: exactOptional(number()),
});

export type EndTraceParameters = InferMatching<
  typeof EndTraceParametersStruct,
  EndTraceParams
>;

/**
 * Handler for the `snap_endTrace` method.
 *
 * @internal
 */
export const endTraceHandler = {
  methodNames: [methodName] as const,
  implementation: getEndTraceImplementation,
  hookNames,
} satisfies PermittedHandlerExport<
  EndTraceMethodHooks,
  EndTraceParameters,
  EndTraceResult
>;

/**
 * The `snap_endTrace` method implementation. This method is used to end a
 * performance trace in Sentry. It is only available to preinstalled Snaps.
 *
 * @param request - The JSON-RPC request object.
 * @param response - The JSON-RPC response object.
 * @param _next - The `json-rpc-engine` "next" callback. Not used by this
 * function.
 * @param end - The `json-rpc-engine` "end" callback.
 * @param hooks - The RPC method hooks.
 * @param hooks.endTrace - The hook function to end a performance trace.
 * @param hooks.getSnap - The hook function to get Snap metadata.
 * @returns Nothing.
 */
function getEndTraceImplementation(
  request: JsonRpcRequest<EndTraceParameters>,
  response: PendingJsonRpcResponse,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  { endTrace, getSnap }: EndTraceMethodHooks,
): void {
  const snap = getSnap(
    (request as JsonRpcRequest<EndTraceParams> & { origin: string }).origin,
  );

  if (!snap?.preinstalled) {
    return end(rpcErrors.methodNotFound());
  }

  const { params } = request;

  try {
    const validatedParams = getValidatedParams(params);
    endTrace(validatedParams);

    response.result = null;
  } catch (error) {
    return end(error);
  }

  return end();
}

/**
 * Validate the parameters for the `snap_endTrace` method.
 *
 * @param params - Parameters to validate.
 * @returns Validated parameters.
 * @throws Throws RPC error if validation fails.
 */
function getValidatedParams(params: unknown): EndTraceParameters {
  try {
    return create(params, EndTraceParametersStruct);
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
