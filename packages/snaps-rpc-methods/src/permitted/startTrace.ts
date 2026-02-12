import type { JsonRpcEngineEndCallback } from '@metamask/json-rpc-engine';
import type { PermittedHandlerExport } from '@metamask/permission-controller';
import { rpcErrors } from '@metamask/rpc-errors';
import type {
  JsonRpcRequest,
  StartTraceParams,
  StartTraceResult,
  TraceContext,
  TraceRequest,
} from '@metamask/snaps-sdk';
import type { InferMatching, Snap } from '@metamask/snaps-utils';
import {
  boolean,
  number,
  record,
  union,
  create,
  object,
  string,
  StructError,
  exactOptional,
} from '@metamask/superstruct';
import type { PendingJsonRpcResponse } from '@metamask/utils';
import { JsonStruct } from '@metamask/utils';

import type { MethodHooksObject } from '../utils';

const methodName = 'snap_startTrace';

const hookNames: MethodHooksObject<StartTraceMethodHooks> = {
  startTrace: true,
  getSnap: true,
};

export type StartTraceMethodHooks = {
  /**
   * Start a performance trace in Sentry.
   *
   * @param request - The trace request object.
   * @returns The performance trace context.
   */
  startTrace: (request: TraceRequest) => TraceContext;

  /**
   * Get Snap metadata.
   *
   * @param snapId - The ID of a Snap.
   */
  getSnap: (snapId: string) => Snap | undefined;
};

const StartTraceParametersStruct = object({
  data: exactOptional(record(string(), union([string(), number(), boolean()]))),
  id: exactOptional(string()),
  name: string(),
  parentContext: exactOptional(JsonStruct),
  startTime: exactOptional(number()),
  tags: exactOptional(record(string(), union([string(), number(), boolean()]))),
});

export type StartTraceParameters = InferMatching<
  typeof StartTraceParametersStruct,
  StartTraceParams
>;

/**
 * Handler for the `snap_startTrace` method.
 */
export const startTraceHandler = {
  methodNames: [methodName] as const,
  implementation: getStartTraceImplementation,
  hookNames,
} satisfies PermittedHandlerExport<
  StartTraceMethodHooks,
  StartTraceParameters,
  StartTraceResult
>;

/**
 * The `snap_startTrace` method implementation. This method is used to start a
 * performance trace in Sentry. It is only available to preinstalled Snaps.
 *
 * @param request - The JSON-RPC request object.
 * @param response - The JSON-RPC response object.
 * @param _next - The `json-rpc-engine` "next" callback. Not used by this
 * function.
 * @param end - The `json-rpc-engine` "end" callback.
 * @param hooks - The RPC method hooks.
 * @param hooks.startTrace - The hook function to start a performance trace.
 * @param hooks.getSnap - The hook function to get Snap metadata.
 * @returns Nothing.
 */
function getStartTraceImplementation(
  request: JsonRpcRequest<StartTraceParameters>,
  response: PendingJsonRpcResponse,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  { startTrace, getSnap }: StartTraceMethodHooks,
): void {
  const snap = getSnap(
    (request as JsonRpcRequest<StartTraceParams> & { origin: string }).origin,
  );

  if (!snap?.preinstalled) {
    return end(rpcErrors.methodNotFound());
  }

  const { params } = request;

  try {
    const validatedParams = getValidatedParams(params);
    response.result = startTrace(validatedParams);
  } catch (error) {
    return end(error);
  }

  return end();
}

/**
 * Validate the parameters for the `snap_startTrace` method.
 *
 * @param params - Parameters to validate.
 * @returns Validated parameters.
 * @throws Throws RPC error if validation fails.
 */
function getValidatedParams(params: unknown): StartTraceParameters {
  try {
    return create(params, StartTraceParametersStruct);
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
