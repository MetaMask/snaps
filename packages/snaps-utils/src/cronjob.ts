import { selectiveUnion, ISO8601DurationStruct } from '@metamask/snaps-sdk';
import type { Infer } from '@metamask/superstruct';
import {
  array,
  create,
  object,
  optional,
  refine,
  string,
} from '@metamask/superstruct';
import {
  hasProperty,
  isObject,
  JsonRpcIdStruct,
  JsonRpcParamsStruct,
  JsonRpcVersionStruct,
} from '@metamask/utils';
import { parseExpression } from 'cron-parser';

export const CronjobRpcRequestStruct = object({
  jsonrpc: optional(JsonRpcVersionStruct),
  id: optional(JsonRpcIdStruct),
  method: string(),
  params: optional(JsonRpcParamsStruct),
});

export type CronjobRpcRequest = Infer<typeof CronjobRpcRequestStruct>;

export const CronExpressionStruct = refine(
  string(),
  'cronjob expression',
  (value) => {
    try {
      parseExpression(value);
      return true;
    } catch {
      return `Expected a cronjob expression, but received: "${value}"`;
    }
  },
);

export type CronExpression = Infer<typeof CronExpressionStruct>;

const CronjobExpressionSpecificationStruct = object({
  expression: CronExpressionStruct,
  request: CronjobRpcRequestStruct,
});

const CronjobDurationSpecificationStruct = object({
  duration: ISO8601DurationStruct,
  request: CronjobRpcRequestStruct,
});

export const CronjobSpecificationStruct = selectiveUnion((value) => {
  if (isObject(value) && hasProperty(value, 'duration')) {
    return CronjobDurationSpecificationStruct;
  }

  return CronjobExpressionSpecificationStruct;
});

export type CronjobSpecification = Infer<typeof CronjobSpecificationStruct>;

/**
 * Check if the given value is a {@link CronjobSpecification} object.
 *
 * @param value - The value to check.
 * @returns Whether the value is a valid {@link CronjobSpecification} object.
 */
export function isCronjobSpecification(value: unknown): boolean {
  try {
    create(value, CronjobSpecificationStruct);
    return true;
  } catch {
    return false;
  }
}

export const CronjobSpecificationArrayStruct = array(
  CronjobSpecificationStruct,
);

/**
 * Check if the given value is an array of {@link CronjobSpecification} objects.
 *
 * @param value - The value to check.
 * @returns Whether the value is a valid array of {@link CronjobSpecification} objects.
 */
export function isCronjobSpecificationArray(value: unknown): boolean {
  try {
    create(value, CronjobSpecificationArrayStruct);
    return true;
  } catch {
    return false;
  }
}
