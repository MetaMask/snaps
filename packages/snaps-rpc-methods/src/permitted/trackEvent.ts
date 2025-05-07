import type { JsonRpcEngineEndCallback } from '@metamask/json-rpc-engine';
import type { PermittedHandlerExport } from '@metamask/permission-controller';
import { rpcErrors } from '@metamask/rpc-errors';
import type {
  JsonRpcRequest,
  TrackEventParams,
  TrackEventResult,
} from '@metamask/snaps-sdk';
import type { InferMatching, Snap } from '@metamask/snaps-utils';
import {
  create,
  object,
  optional,
  record,
  refine,
  string,
  StructError,
} from '@metamask/superstruct';
import type { Json, PendingJsonRpcResponse } from '@metamask/utils';
import { JsonStruct } from '@metamask/utils';

import type { MethodHooksObject } from '../utils';

const PropertiesStruct = optional(record(string(), JsonStruct));

const snakeCaseRegex = /^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/u;

const SnakeCasePropertiesStruct = refine(
  PropertiesStruct,
  'snake_case_keys',
  (value) => {
    if (!value) {
      return true;
    }

    return Object.keys(value).every((key) => snakeCaseRegex.test(key));
  },
);

const hookNames: MethodHooksObject<TrackEventMethodHooks> = {
  trackEvent: true,
  getSnap: true,
};

export type TrackEventMethodHooks = {
  /**
   * Track an event.
   *
   * @param event - The event object containing event details and properties.
   */
  trackEvent: (event: TrackEventObject) => void;
  /**
   * Get Snap metadata.
   *
   * @param snapId - The ID of a Snap.
   */
  getSnap: (snapId: string) => Snap | undefined;
};

export type TrackEventObject = {
  event: string;
  properties?: Record<string, Json>;
  sensitiveProperties?: Record<string, Json>;
};

const TrackEventParametersStruct = object({
  event: object({
    event: string(),
    properties: SnakeCasePropertiesStruct,
    sensitiveProperties: SnakeCasePropertiesStruct,
  }),
});

export type TrackEventParameters = InferMatching<
  typeof TrackEventParametersStruct,
  TrackEventParams
>;

/**
 * Handler for the `snap_trackEvent` method.
 */
export const trackEventHandler: PermittedHandlerExport<
  TrackEventMethodHooks,
  TrackEventParameters,
  TrackEventResult
> = {
  methodNames: ['snap_trackEvent'],
  implementation: getTrackEventImplementation,
  hookNames,
};

/**
 * The `snap_trackEvent` method implementation.
 * This method allows pre-installed Snaps to submit tracking events to the client.
 *
 * @param req - The JSON-RPC request object.
 * @param res - The JSON-RPC response object.
 * @param _next - The `json-rpc-engine` "next" callback. Not used by this function.
 * @param end - The `json-rpc-engine` "end" callback.
 * @param hooks - The RPC method hooks.
 * @param hooks.trackEvent - The function to track the event.
 * @param hooks.getSnap - The function to get Snap metadata.
 * @returns Nothing.
 */
function getTrackEventImplementation(
  req: JsonRpcRequest<TrackEventParameters>,
  res: PendingJsonRpcResponse<TrackEventResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  { trackEvent, getSnap }: TrackEventMethodHooks,
): void {
  const snap = getSnap(
    (req as JsonRpcRequest<TrackEventParams> & { origin: string }).origin,
  );

  if (!snap?.preinstalled) {
    return end(rpcErrors.methodNotFound());
  }

  const { params } = req;

  try {
    const validatedParams = getValidatedParams(params);
    trackEvent(validatedParams.event);
    res.result = null;
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
function getValidatedParams(params: unknown): TrackEventParameters {
  try {
    return create(params, TrackEventParametersStruct);
  } catch (error) {
    if (error instanceof StructError) {
      if (error.refinement === 'snake_case_keys') {
        throw rpcErrors.invalidParams({
          message: `Invalid params: All property keys must be in snake_case format. The following key contains invalid properties: "${error.key}".`,
        });
      }

      throw rpcErrors.invalidParams({
        message: `Invalid params: ${error.message}.`,
      });
    }
    /* istanbul ignore next */
    throw rpcErrors.internal();
  }
}
