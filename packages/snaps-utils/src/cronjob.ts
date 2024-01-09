import {
  JsonRpcIdStruct,
  JsonRpcParamsStruct,
  JsonRpcVersionStruct,
} from '@metamask/utils';
import { parseExpression } from 'cron-parser';
import type { Infer } from 'superstruct';
import { array, create, object, optional, refine, string } from 'superstruct';

export const CronjobRpcRequestStruct = object({
  jsonrpc: optional(JsonRpcVersionStruct),
  id: optional(JsonRpcIdStruct),
  method: string(),
  params: optional(JsonRpcParamsStruct),
});

export type CronjobRpcRequest = Infer<typeof CronjobRpcRequestStruct>;

export const CronExpressionStruct = refine(
  string(),
  'CronExpression',
  (value) => {
    try {
      parseExpression(value);
      return true;
    } catch {
      return false;
    }
  },
);

export type CronExpression = Infer<typeof CronExpressionStruct>;

/**
 * Parses a cron expression.
 *
 * @param expression - Expression to parse.
 * @returns A CronExpression class instance.
 */
export function parseCronExpression(expression: string | object) {
  const ensureStringExpression = create(expression, CronExpressionStruct);
  return parseExpression(ensureStringExpression);
}

export const CronjobSpecificationStruct = object({
  expression: CronExpressionStruct,
  request: CronjobRpcRequestStruct,
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
