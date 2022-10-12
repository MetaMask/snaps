import { HandlerType } from '@metamask/snap-utils';
import { SnapKeyring } from '@metamask/snap-types';
import {
  array,
  assign,
  enums,
  Infer,
  is,
  literal,
  object,
  omit,
  optional,
  record,
  string,
  tuple,
  union,
  unknown,
} from 'superstruct';
import {
  Json,
  JsonRpcIdStruct,
  JsonRpcRequestStruct,
  JsonRpcSuccess,
  JsonRpcSuccessStruct,
} from '@metamask/utils';

const VALIDATION_FUNCTIONS = {
  [HandlerType.OnRpcRequest]: validateFunctionExport,
  [HandlerType.OnTransaction]: validateFunctionExport,
  [HandlerType.SnapKeyring]: validateKeyringExport,
};

/**
 * Validates a function export.
 *
 * @param snapExport - The export itself.
 * @returns True if the export matches the expected shape, false otherwise.
 */
function validateFunctionExport(
  snapExport: unknown,
): snapExport is (...args: unknown[]) => unknown {
  return typeof snapExport === 'function';
}

/**
 * Validates a keyring export.
 *
 * @param snapExport - The export itself.
 * @returns True if the export matches the expected shape, false otherwise.
 */
function validateKeyringExport(snapExport: unknown): snapExport is SnapKeyring {
  // TODO Decide whether we want more validation
  return typeof snapExport === 'object';
}

/**
 * Validates a given snap export.
 *
 * @param type - The type of export expected.
 * @param snapExport - The export itself.
 * @returns True if the export matches the expected shape, false otherwise.
 */
export function validateExport(type: HandlerType, snapExport: unknown) {
  const validationFunction = VALIDATION_FUNCTIONS[type];
  return validationFunction?.(snapExport) ?? false;
}

export const JsonRpcRequestWithoutIdStruct = assign(
  omit(JsonRpcRequestStruct, ['id']),
  object({
    id: optional(JsonRpcIdStruct),
  }),
);

export type JsonRpcRequestWithoutId = Infer<
  typeof JsonRpcRequestWithoutIdStruct
>;

/**
 * Check if the given value is a JSON-RPC request with an optional ID.
 *
 * @param value - The value to check.
 * @returns Whether the value is a JSON-RPC request with an optional ID.
 */
export function isJsonRpcRequestWithoutId(
  value: unknown,
): value is JsonRpcRequestWithoutId {
  return is(value, JsonRpcRequestWithoutIdStruct);
}

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

export const TerminateRequestStruct = union([literal(undefined), array()]);

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
      params: optional(record(string(), unknown())),
    }),
  ),
]);

export type PingRequestArguments = Infer<typeof PingRequestArgumentsStruct>;
export type TerminateRequestArguments = Infer<typeof TerminateRequestStruct>;

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
