import type { JsonRpcEngineEndCallback } from '@metamask/json-rpc-engine';
import type { PermittedHandlerExport } from '@metamask/permission-controller';
import { rpcErrors } from '@metamask/rpc-errors';
import type {
  JsonRpcRequest,
  TrackableError,
  TrackErrorParams,
  TrackErrorResult,
} from '@metamask/snaps-sdk';
import type { InferMatching, Snap } from '@metamask/snaps-utils';
import type { Struct } from '@metamask/superstruct';
import {
  create,
  lazy,
  nullable,
  object,
  string,
  StructError,
} from '@metamask/superstruct';
import type { PendingJsonRpcResponse } from '@metamask/utils';

import type { MethodHooksObject } from '../utils';

const hookNames: MethodHooksObject<TrackErrorMethodHooks> = {
  trackError: true,
  getSnap: true,
};

export type TrackErrorMethodHooks = {
  /**
   * Track an error.
   *
   * @param error - The error object to track.
   * @returns The ID of the tracked error, as returned by the Sentry instance
   * in the client.
   */
  trackError: (error: Error) => string;

  /**
   * Get Snap metadata.
   *
   * @param snapId - The ID of a Snap.
   */
  getSnap: (snapId: string) => Snap | undefined;
};

const TrackableErrorStruct: Struct<TrackableError> = object({
  name: string(),
  message: string(),
  stack: nullable(string()),
  cause: nullable(lazy<TrackableError>(() => TrackableErrorStruct)),
});

const TrackErrorParametersStruct = object({
  error: TrackableErrorStruct,
});

export type TrackErrorParameters = InferMatching<
  typeof TrackErrorParametersStruct,
  TrackErrorParams
>;

/**
 * Handler for the `snap_trackError` method.
 */
export const trackErrorHandler: PermittedHandlerExport<
  TrackErrorMethodHooks,
  TrackErrorParameters,
  TrackErrorResult
> = {
  methodNames: ['snap_trackError'],
  implementation: getTrackErrorImplementation,
  hookNames,
};

/**
 * The `snap_trackError` method implementation. This method allows preinstalled
 * Snaps to send errors to the Sentry instance in the client for tracking.
 *
 * @param request - The JSON-RPC request object.
 * @param response - The JSON-RPC response object.
 * @param _next - The `json-rpc-engine` "next" callback. Not used by this
 * function.
 * @param end - The `json-rpc-engine` "end" callback.
 * @param hooks - The RPC method hooks.
 * @param hooks.trackError - The hook function to track an error.
 * @param hooks.getSnap - The hook function to get Snap metadata.
 * @returns Nothing.
 */
function getTrackErrorImplementation(
  request: JsonRpcRequest<TrackErrorParameters>,
  response: PendingJsonRpcResponse<TrackErrorResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  { trackError, getSnap }: TrackErrorMethodHooks,
): void {
  const snap = getSnap(
    (request as JsonRpcRequest<TrackErrorParams> & { origin: string }).origin,
  );

  if (!snap?.preinstalled) {
    return end(rpcErrors.methodNotFound());
  }

  const { params } = request;

  try {
    const validatedParams = getValidatedParams(params);
    const error = deserializeError(validatedParams.error);

    response.result = trackError(error);
  } catch (error) {
    return end(error);
  }

  return end();
}

/**
 * Validates the parameters for the snap_trackEvent method.
 *
 * @param params - Parameters to validate.
 * @returns Validated parameters.
 * @throws Throws RPC error if validation fails.
 */
function getValidatedParams(params: unknown): TrackErrorParameters {
  try {
    return create(params, TrackErrorParametersStruct);
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

/**
 * Deserialize a {@link TrackableError} into a standard {@link Error} object.
 *
 * @param error - The error to deserialize.
 * @returns A standard {@link Error} object with the same properties as the
 * original {@link TrackableError}.
 */
function deserializeError(error: TrackableError): Error {
  const deserializedError = new Error(error.message);
  deserializedError.name = error.name;
  deserializedError.stack = error.stack ?? undefined;
  deserializedError.cause = error.cause
    ? deserializeError(error.cause)
    : undefined;

  return deserializedError;
}
