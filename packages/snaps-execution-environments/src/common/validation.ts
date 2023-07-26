import { ChainIdStruct, HandlerType } from '@metamask/snaps-utils';
import type { Json, JsonRpcSuccess } from '@metamask/utils';
import {
  assertStruct,
  JsonRpcIdStruct,
  JsonRpcRequestStruct,
  JsonRpcSuccessStruct,
  JsonStruct,
} from '@metamask/utils';
import type { Infer } from 'superstruct';
import {
  array,
  assign,
  enums,
  is,
  literal,
  nullable,
  object,
  omit,
  optional,
  record,
  string,
  tuple,
  union,
} from 'superstruct';

export const JsonRpcRequestWithoutIdStruct = assign(
  omit(JsonRpcRequestStruct, ['id']),
  object({
    id: optional(JsonRpcIdStruct),
  }),
);

export type JsonRpcRequestWithoutId = Infer<
  typeof JsonRpcRequestWithoutIdStruct
>;

export const EndowmentStruct = string();
export type Endowment = Infer<typeof EndowmentStruct>;

/**
 * Check if the given value is an endowment.
 *
 * @param value - The value to check.
 * @returns Whether the value is an endowment.
 */
export function isEndowment(value: unknown): value is Endowment {
  return is(value, EndowmentStruct);
}

/**
 * Check if the given value is an array of endowments.
 *
 * @param value - The value to check.
 * @returns Whether the value is an array of endowments.
 */
export function isEndowmentsArray(value: unknown): value is Endowment[] {
  return Array.isArray(value) && value.every(isEndowment);
}

const OkStruct = literal('OK');

export const PingRequestArgumentsStruct = optional(
  union([literal(undefined), array()]),
);

export const TerminateRequestArgumentsStruct = union([
  literal(undefined),
  array(),
]);

export const ExecuteSnapRequestArgumentsStruct = tuple([
  string(),
  string(),
  optional(array(EndowmentStruct)),
]);

export const SnapRpcRequestArgumentsStruct = tuple([
  string(),
  enums(Object.values(HandlerType)),
  string(),
  assign(
    JsonRpcRequestWithoutIdStruct,
    object({
      params: optional(record(string(), JsonStruct)),
    }),
  ),
]);

export type PingRequestArguments = Infer<typeof PingRequestArgumentsStruct>;
export type TerminateRequestArguments = Infer<
  typeof TerminateRequestArgumentsStruct
>;

export type ExecuteSnapRequestArguments = Infer<
  typeof ExecuteSnapRequestArgumentsStruct
>;

export type SnapRpcRequestArguments = Infer<
  typeof SnapRpcRequestArgumentsStruct
>;

export type RequestArguments =
  | PingRequestArguments
  | TerminateRequestArguments
  | ExecuteSnapRequestArguments
  | SnapRpcRequestArguments;

export const OnTransactionRequestArgumentsStruct = object({
  // TODO: Improve `transaction` type.
  transaction: record(string(), JsonStruct),
  chainId: ChainIdStruct,
  transactionOrigin: nullable(string()),
});

export type OnTransactionRequestArguments = Infer<
  typeof OnTransactionRequestArgumentsStruct
>;

/**
 * Asserts that the given value is a valid {@link OnTransactionRequestArguments}
 * object.
 *
 * @param value - The value to validate.
 * @throws If the value is not a valid {@link OnTransactionRequestArguments}
 * object.
 */
export function assertIsOnTransactionRequestArguments(
  value: unknown,
): asserts value is OnTransactionRequestArguments {
  assertStruct(
    value,
    OnTransactionRequestArgumentsStruct,
    'Invalid request params',
  );
}

const OkResponseStruct = assign(
  JsonRpcSuccessStruct,
  object({
    result: OkStruct,
  }),
);

const SnapRpcResponse = JsonRpcSuccessStruct;

export type OkResponse = Infer<typeof OkResponseStruct>;
export type SnapRpcResponse = Infer<typeof SnapRpcResponse>;

export type Response = OkResponse | SnapRpcResponse;

type RequestParams<Params extends unknown[] | undefined> =
  Params extends undefined ? [] : Params;

type RequestFunction<
  Args extends RequestArguments,
  ResponseType extends JsonRpcSuccess<Json>,
> = (...args: RequestParams<Args>) => Promise<ResponseType['result']>;

export type Ping = RequestFunction<PingRequestArguments, OkResponse>;
export type Terminate = RequestFunction<TerminateRequestArguments, OkResponse>;
export type ExecuteSnap = RequestFunction<
  ExecuteSnapRequestArguments,
  OkResponse
>;
export type SnapRpc = RequestFunction<SnapRpcRequestArguments, SnapRpcResponse>;
