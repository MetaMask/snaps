import type {
  JsonRpcEngineEndCallback,
  MethodHandler,
} from '@metamask/json-rpc-engine';
import type { Messenger } from '@metamask/messenger';
import { rpcErrors } from '@metamask/rpc-errors';
import type {
  JsonRpcRequest,
  StartTraceParams,
  StartTraceResult,
  TraceContext,
  TraceRequest,
} from '@metamask/snaps-sdk';
import type { InferMatching } from '@metamask/snaps-utils';
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

import type { SnapControllerGetAction } from '../types';
import type { MethodHooksObject } from '../utils';

const hookNames: MethodHooksObject<StartTraceMethodHooks> = {
  startTrace: true,
};

export type StartTraceMethodHooks = {
  /**
   * Start a performance trace in Sentry.
   *
   * @param request - The trace request object.
   * @returns The performance trace context.
   */
  startTrace: (request: TraceRequest) => TraceContext;
};

export type StartTraceMethodActions = SnapControllerGetAction;

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
 *
 * @internal
 */
export const startTraceHandler = {
  implementation: getStartTraceImplementation,
  hookNames,
  actionNames: ['SnapController:getSnap'],
} satisfies MethodHandler<
  StartTraceMethodHooks,
  StartTraceMethodActions,
  StartTraceParameters,
  StartTraceResult,
  { origin: string }
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
 * @param messenger - The messenger used to call controller actions.
 * @returns Nothing.
 */
function getStartTraceImplementation(
  request: JsonRpcRequest<StartTraceParameters> & { origin: string },
  response: PendingJsonRpcResponse,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  { startTrace }: StartTraceMethodHooks,
  messenger: Messenger<string, StartTraceMethodActions>,
): void {
  const snap = messenger.call('SnapController:getSnap', request.origin);

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
