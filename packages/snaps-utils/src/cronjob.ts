import { Json, JsonRpcRequestStruct } from '@metamask/utils';
import { parseExpression } from 'cron-parser';
import {
  array,
  assign,
  coerce,
  create,
  Infer,
  object,
  omit,
  optional,
  partial,
  pick,
  refine,
  string,
  Struct,
} from 'superstruct';

// TODO(ritave): Remove after merging - https://github.com/MetaMask/utils/pull/51
type TMPJsonRpc = Struct<
  {
    id: string | number | null;
    method: string;
    jsonrpc: '2.0';
    params?: Json[] | Record<string, Json> | undefined;
  },
  {
    id: Struct<string | number | null, null>;
    jsonrpc: Struct<'2.0', '2.0'>;
    method: Struct<string, null>;
    params: Struct<Json[] | Record<string, Json> | undefined, null>;
  }
>;

export const CronjobRpcRequestStruct = assign(
  partial(pick(JsonRpcRequestStruct as TMPJsonRpc, ['id', 'jsonrpc'])),
  omit(JsonRpcRequestStruct as TMPJsonRpc, ['id', 'jsonrpc']),
);
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
