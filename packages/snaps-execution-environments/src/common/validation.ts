import { rpcErrors } from '@metamask/rpc-errors';
import {
  InterfaceContextStruct,
  UserInputEventStruct,
} from '@metamask/snaps-sdk';
import { ChainIdStruct, HandlerType } from '@metamask/snaps-utils';
import type { Json, JsonRpcSuccess } from '@metamask/utils';
import {
  assertStruct,
  JsonRpcIdStruct,
  JsonRpcParamsStruct,
  JsonRpcSuccessStruct,
  JsonRpcVersionStruct,
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
  optional,
  record,
  string,
  tuple,
  union,
} from 'superstruct';

export const JsonRpcRequestWithoutIdStruct = object({
  jsonrpc: optional(JsonRpcVersionStruct),
  id: optional(JsonRpcIdStruct),
  method: string(),
  params: optional(JsonRpcParamsStruct),
});

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
  array(EndowmentStruct),
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
    rpcErrors.invalidParams,
  );
}

export const OnSignatureRequestArgumentsStruct = object({
  signature: record(string(), JsonStruct),
  signatureOrigin: nullable(string()),
});

export type OnSignatureRequestArguments = Infer<
  typeof OnSignatureRequestArgumentsStruct
>;

/**
 * Asserts that the given value is a valid {@link OnSignatureRequestArguments}
 * object.
 *
 * @param value - The value to validate.
 * @throws If the value is not a valid {@link OnSignatureRequestArguments}
 * object.
 */
export function assertIsOnSignatureRequestArguments(
  value: unknown,
): asserts value is OnSignatureRequestArguments {
  assertStruct(
    value,
    OnSignatureRequestArgumentsStruct,
    'Invalid request params',
    rpcErrors.invalidParams,
  );
}

const baseNameLookupArgs = { chainId: ChainIdStruct };
const domainRequestStruct = object({
  ...baseNameLookupArgs,
  address: string(),
});
const addressRequestStruct = object({
  ...baseNameLookupArgs,
  domain: string(),
});

export const OnNameLookupRequestArgumentsStruct = union([
  domainRequestStruct,
  addressRequestStruct,
]);

export type OnNameLookupRequestArguments = Infer<
  typeof OnNameLookupRequestArgumentsStruct
>;

export type PossibleLookupRequestArgs = typeof baseNameLookupArgs & {
  address?: string;
  domain?: string;
};

/**
 * Asserts that the given value is a valid {@link OnNameLookupRequestArguments}
 * object.
 *
 * @param value - The value to validate.
 * @throws If the value is not a valid {@link OnNameLookupRequestArguments}
 * object.
 */
export function assertIsOnNameLookupRequestArguments(
  value: unknown,
): asserts value is OnNameLookupRequestArguments {
  assertStruct(
    value,
    OnNameLookupRequestArgumentsStruct,
    'Invalid request params',
    rpcErrors.invalidParams,
  );
}

export const OnUserInputArgumentsStruct = object({
  id: string(),
  event: UserInputEventStruct,
  context: optional(nullable(InterfaceContextStruct)),
});

export type OnUserInputArguments = Infer<typeof OnUserInputArgumentsStruct>;

/**
 * Asserts that the given value is a valid {@link OnUserInputArguments}
 * object.
 *
 * @param value - The value to validate.
 * @throws If the value is not a valid {@link OnUserInputArguments}
 * object.
 */
export function assertIsOnUserInputRequestArguments(
  value: unknown,
): asserts value is OnUserInputArguments {
  assertStruct(
    value,
    OnUserInputArgumentsStruct,
    'Invalid request params',
    rpcErrors.invalidParams,
  );
}

const OkResponseStruct = object({
  id: JsonRpcIdStruct,
  jsonrpc: JsonRpcVersionStruct,
  result: OkStruct,
});

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
