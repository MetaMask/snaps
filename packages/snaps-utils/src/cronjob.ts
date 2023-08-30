import type { Json } from '@metamask/utils';
import { JsonRpcRequestStruct } from '@metamask/utils';
import { parseExpression } from 'cron-parser';
import type { Infer, Struct } from 'superstruct';
import {
  array,
  assign,
  coerce,
  create,
  object,
  omit,
  optional,
  partial,
  pick,
  refine,
  string,
} from 'superstruct';

type MTCronjobRpcRequestStructType = Struct<
  {
    method: string;
    params?: Record<string, Json> | Json[];
    id?: string | number | null;
    jsonrpc?: '2.0';
  },
  {
    params?: Struct<Record<string, Json> | Json[], null>;
    method: Struct<string, null>;
    id?: Struct<string | number | null>;
    jsonrpc?: Struct<'2.0'>;
  }
>;
export const CronjobRpcRequestStruct: MTCronjobRpcRequestStructType = assign(
  partial(pick(JsonRpcRequestStruct as any, ['id', 'jsonrpc'])),
  omit(JsonRpcRequestStruct as any, ['id', 'jsonrpc']),
) as any as MTCronjobRpcRequestStructType;

export type CronjobRpcRequest = Infer<typeof CronjobRpcRequestStruct>;

export const CronExpressionStruct = refine(
  coerce(
    string(),
    object({
      minute: optional(string()),
      hour: optional(string()),
      dayOfMonth: optional(string()),
      month: optional(string()),
      dayOfWeek: optional(string()),
    }),
    (value) =>
      `${value.minute ?? '*'} ${value.hour ?? '*'} ${value.dayOfMonth ?? '*'} ${
        value.month ?? '*'
      } ${value.dayOfWeek ?? '*'}`,
  ),
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
