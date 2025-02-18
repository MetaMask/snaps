import type { JsonRpcEngineEndCallback } from '@metamask/json-rpc-engine';
import type { PermittedHandlerExport } from '@metamask/permission-controller';
import { providerErrors, rpcErrors } from '@metamask/rpc-errors';
import {
  selectiveUnion,
  type JsonRpcRequest,
  type ScheduleBackgroundEventParams,
  type ScheduleBackgroundEventResult,
} from '@metamask/snaps-sdk';
import type { CronjobRpcRequest, InferMatching } from '@metamask/snaps-utils';
import { CronjobRpcRequestStruct } from '@metamask/snaps-utils';
import {
  StructError,
  create,
  object,
  refine,
  string,
} from '@metamask/superstruct';
import {
  assert,
  hasProperty,
  type PendingJsonRpcResponse,
} from '@metamask/utils';
import { DateTime, Duration } from 'luxon';

import { SnapEndowments } from '../endowments';
import type { MethodHooksObject } from '../utils';

const methodName = 'snap_scheduleBackgroundEvent';

const hookNames: MethodHooksObject<ScheduleBackgroundEventMethodHooks> = {
  scheduleBackgroundEvent: true,
  hasPermission: true,
};

type ScheduleBackgroundEventHookParams = {
  date: string;
  request: CronjobRpcRequest;
};

export type ScheduleBackgroundEventMethodHooks = {
  scheduleBackgroundEvent: (
    snapEvent: ScheduleBackgroundEventHookParams,
  ) => string;

  hasPermission: (permissionName: string) => boolean;
};

export const scheduleBackgroundEventHandler: PermittedHandlerExport<
  ScheduleBackgroundEventMethodHooks,
  ScheduleBackgroundEventParameters,
  ScheduleBackgroundEventResult
> = {
  methodNames: [methodName],
  implementation: getScheduleBackgroundEventImplementation,
  hookNames,
};

const offsetRegex = /Z|([+-]\d{2}:?\d{2})$/u;

const ScheduleBackgroundEventParametersWithDateStruct = object({
  date: refine(string(), 'date', (val) => {
    const date = DateTime.fromISO(val);
    if (date.isValid) {
      // Luxon doesn't have a reliable way to check if timezone info was not provided
      if (!offsetRegex.test(val)) {
        return 'ISO 8601 date must have timezone information';
      }
      return true;
    }
    return 'Not a valid ISO 8601 date';
  }),
  request: CronjobRpcRequestStruct,
});

const ScheduleBackgroundEventParametersWithDurationStruct = object({
  duration: refine(string(), 'duration', (val) => {
    const duration = Duration.fromISO(val);
    if (!duration.isValid) {
      return 'Not a valid ISO 8601 duration';
    }
    return true;
  }),
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
 * Generates a `DateTime` object based on if a duration or date is provided.
 *
 * @param params - The validated params from the `snap_scheduleBackgroundEvent` call.
 * @returns A `DateTime` object.
 */
function getStartDate(params: ScheduleBackgroundEventParams) {
  if ('duration' in params) {
    return DateTime.fromJSDate(new Date())
      .toUTC()
      .plus(Duration.fromISO(params.duration));
  }

  return DateTime.fromISO(params.date, { setZone: true });
}

/**
 * The `snap_scheduleBackgroundEvent` method implementation.
 *
 * @param req - The JSON-RPC request object.
 * @param res - The JSON-RPC response object.
 * @param _next - The `json-rpc-engine` "next" callback. Not used by this
 * function.
 * @param end - The `json-rpc-engine` "end" callback.
 * @param hooks - The RPC method hooks.
 * @param hooks.scheduleBackgroundEvent - The function to schedule a background event.
 * @param hooks.hasPermission - The function to check if a snap has the `endowment:cronjob` permission.
 * @returns An id representing the background event.
 */
async function getScheduleBackgroundEventImplementation(
  req: JsonRpcRequest<ScheduleBackgroundEventParameters>,
  res: PendingJsonRpcResponse<ScheduleBackgroundEventResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  {
    scheduleBackgroundEvent,
    hasPermission,
  }: ScheduleBackgroundEventMethodHooks,
): Promise<void> {
  const { params } = req;

  if (!hasPermission(SnapEndowments.Cronjob)) {
    return end(providerErrors.unauthorized());
  }

  try {
    const validatedParams = getValidatedParams(params);

    const { request } = validatedParams;

    const date = getStartDate(validatedParams);

    // Make sure any millisecond precision is removed.
    const truncatedDate = date.startOf('second').toISO({
      suppressMilliseconds: true,
    });

    assert(truncatedDate);

    const id = scheduleBackgroundEvent({ date: truncatedDate, request });
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
