import type {
  JsonRpcEngineEndCallback,
  MethodHandler,
} from '@metamask/json-rpc-engine';
import type { Messenger } from '@metamask/messenger';
import type { PermissionControllerHasPermissionAction } from '@metamask/permission-controller';
import { providerErrors, rpcErrors } from '@metamask/rpc-errors';
import {
  selectiveUnion,
  type JsonRpcRequest,
  type ScheduleBackgroundEventParams,
  type ScheduleBackgroundEventResult,
  type SnapId,
} from '@metamask/snaps-sdk';
import type { InferMatching } from '@metamask/snaps-utils';
import {
  CronjobRpcRequestStruct,
  ISO8601DateStruct,
  ISO8601DurationStruct,
} from '@metamask/snaps-utils';
import { StructError, create, object } from '@metamask/superstruct';
import { hasProperty, type PendingJsonRpcResponse } from '@metamask/utils';

import { SnapEndowments } from '../endowments';
import type { CronjobControllerScheduleAction } from '../types';

export type ScheduleBackgroundEventMethodActions =
  | PermissionControllerHasPermissionAction
  | CronjobControllerScheduleAction;

/**
 * Schedule a background event for a Snap. The background event will trigger a
 * JSON-RPC request to the Snap at the scheduled time, handled by the
 * `onCronjob` entry point in the Snap.
 *
 * The schedule can be defined using either an ISO 8601 date or duration string.
 * For example:
 *
 * - Using a date: `2026-12-31T23:59:59Z`
 * - Using a duration: `P1DT2H` (which represents a duration of 1 day and 2
 * hours)
 *
 * @example
 * ```ts
 * const id = await wallet.request({
 *   method: 'snap_scheduleBackgroundEvent',
 *   params: {
 *     date: '2026-12-31T23:59:59Z',
 *     request: {
 *       method: 'mySnapMethod',
 *       params: { foo: 'bar' },
 *     },
 *   },
 * });
 * ```
 */
export const scheduleBackgroundEventHandler = {
  implementation: getScheduleBackgroundEventImplementation,
  actionNames: [
    'PermissionController:hasPermission',
    'CronjobController:schedule',
  ],
} satisfies MethodHandler<
  never,
  ScheduleBackgroundEventMethodActions,
  ScheduleBackgroundEventParameters,
  ScheduleBackgroundEventResult,
  { origin: SnapId }
>;

const ScheduleBackgroundEventParametersWithDateStruct = object({
  date: ISO8601DateStruct,
  request: CronjobRpcRequestStruct,
});

const ScheduleBackgroundEventParametersWithDurationStruct = object({
  duration: ISO8601DurationStruct,
  request: CronjobRpcRequestStruct,
});

const ScheduleBackgroundEventParametersStruct = selectiveUnion((val) => {
  if (hasProperty(val, 'date')) {
    return ScheduleBackgroundEventParametersWithDateStruct;
  }
  return ScheduleBackgroundEventParametersWithDurationStruct;
});

export type ScheduleBackgroundEventParameters = InferMatching<
  typeof ScheduleBackgroundEventParametersStruct,
  ScheduleBackgroundEventParams
>;

/**
 * Get the schedule for a background event based on the provided parameters.
 *
 * @param params - The parameters for the background event.
 * @returns The schedule parameters for the background event.
 */
function getSchedule(params: ScheduleBackgroundEventParameters): string {
  if (hasProperty(params, 'date')) {
    // TODO: Check why `params.date` is not a string.
    return params.date as string;
  }

  return params.duration;
}

/**
 * The `snap_scheduleBackgroundEvent` method implementation.
 *
 * @param req - The JSON-RPC request object.
 * @param res - The JSON-RPC response object.
 * @param _next - The `json-rpc-engine` "next" callback. Not used by this
 * function.
 * @param end - The `json-rpc-engine` "end" callback.
 * @param _hooks - The RPC method hooks. Not used by this function.
 * @param messenger - The messenger used to call controller actions.
 * @returns An id representing the background event.
 */
async function getScheduleBackgroundEventImplementation(
  req: JsonRpcRequest<ScheduleBackgroundEventParameters> & { origin: SnapId },
  res: PendingJsonRpcResponse<ScheduleBackgroundEventResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  _hooks: never,
  messenger: Messenger<string, ScheduleBackgroundEventMethodActions>,
): Promise<void> {
  const { params, origin } = req;

  if (
    !messenger.call(
      'PermissionController:hasPermission',
      origin,
      SnapEndowments.Cronjob,
    )
  ) {
    return end(providerErrors.unauthorized());
  }

  try {
    const validatedParams = getValidatedParams(params);
    const { request } = validatedParams;
    const schedule = getSchedule(validatedParams);

    const id = messenger.call('CronjobController:schedule', {
      snapId: origin,
      schedule,
      request,
    });

    res.result = id;
  } catch (error) {
    return end(error);
  }

  return end();
}

/**
 * Validate the scheduleBackgroundEvent method `params` and returns them cast to the correct
 * type. Throws if validation fails.
 *
 * @param params - The unvalidated params object from the method request.
 * @returns The validated resolveInterface method parameter object.
 */
function getValidatedParams(
  params: unknown,
): ScheduleBackgroundEventParameters {
  try {
    return create(params, ScheduleBackgroundEventParametersStruct);
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
