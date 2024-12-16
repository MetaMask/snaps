import type { JsonRpcEngineEndCallback } from '@metamask/json-rpc-engine';
import type { PermittedHandlerExport } from '@metamask/permission-controller';
import { providerErrors, rpcErrors } from '@metamask/rpc-errors';
import type {
  JsonRpcRequest,
  ScheduleBackgroundEventParams,
  ScheduleBackgroundEventResult,
} from '@metamask/snaps-sdk';
import type { CronjobRpcRequest } from '@metamask/snaps-utils';
import {
  CronjobRpcRequestStruct,
  type InferMatching,
} from '@metamask/snaps-utils';
import {
  StructError,
  create,
  object,
  refine,
  string,
} from '@metamask/superstruct';
import { type PendingJsonRpcResponse } from '@metamask/utils';
import { DateTime } from 'luxon';

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

const ScheduleBackgroundEventsParametersStruct = object({
  date: refine(string(), 'date', (val) => {
    const date = DateTime.fromISO(val);
    if (date.isValid) {
      // luxon doesn't have a reliable way to check if timezone info was not provided
      const count = val.split('').filter((char) => char === '-').length;
      if (count !== 3 && !val.includes('+') && !val.endsWith('Z')) {
        return 'ISO8601 string must have timezone information';
      }
      return true;
    }
    return 'Not a valid ISO8601 string';
  }),
  request: CronjobRpcRequestStruct,
});

export type ScheduleBackgroundEventParameters = InferMatching<
  typeof ScheduleBackgroundEventsParametersStruct,
  ScheduleBackgroundEventParams
>;

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

    const { date, request } = validatedParams;

    // Make sure any millisecond precision is removed.
    const truncatedDate = DateTime.fromISO(date, { setZone: true })
      .startOf('second')
      .toISO({
        suppressMilliseconds: true,
      }) as string;

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
    return create(params, ScheduleBackgroundEventsParametersStruct);
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
