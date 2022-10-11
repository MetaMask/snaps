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
  string,
  unknown,
} from 'superstruct';
import {
  Json,
  JsonRpcIdStruct,
  JsonRpcRequest,
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

const PingRequestStruct = assign(
  JsonRpcRequestStruct,
  object({
    method: literal('ping'),
    params: optional(unknown()),
  }),
);

const TerminateRequestStruct = assign(
  JsonRpcRequestStruct,
  object({
    method: literal('terminate'),
    params: optional(unknown()),
  }),
);

const ExecuteSnapRequestStruct = assign(
  JsonRpcRequestStruct,
  object({
    method: literal('executeSnap'),
    params: object({
      snapName: string(),
      sourceCode: string(),
      endowments: optional(array(EndowmentStruct)),
    }),
  }),
);

const SnapRpcRequestStruct = assign(
  JsonRpcRequestStruct,
  object({
    method: literal('snapRpc'),
    params: object({
      target: string(),
      handler: enums(Object.values(HandlerType)),
      origin: string(),
      request: JsonRpcRequestStruct,
    }),
  }),
);

export type PingRequest = Infer<typeof PingRequestStruct>;
export type TerminateRequest = Infer<typeof TerminateRequestStruct>;
export type ExecuteSnapRequest = Infer<typeof ExecuteSnapRequestStruct>;
export type SnapRpcRequest = Infer<typeof SnapRpcRequestStruct>;

export type Request =
  | PingRequest
  | TerminateRequest
  | ExecuteSnapRequest
  | SnapRpcRequest;

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

// UnionToIntersection<A | B> = A & B
type UnionToIntersection<U> = (
  U extends unknown ? (arg: U) => 0 : never
) extends (arg: infer I) => 0
  ? I
  : never;

// LastInUnion<A | B> = B
type LastInUnion<U> = UnionToIntersection<
  U extends unknown ? (x: U) => 0 : never
> extends (x: infer L) => 0
  ? L
  : never;

// UnionToTuple<A, B> = [A, B]
type UnionToTuple<T, Last = LastInUnion<T>> = [T] extends [never]
  ? []
  : [Last, ...UnionToTuple<Exclude<T, Last>>];

type InterfaceToTuple<
  T,
  U = UnionToTuple<keyof T>,
  V extends any[] = [],
> = U extends [infer F, ...infer Rest]
  ? F extends keyof T
    ? InterfaceToTuple<T, Rest, [T[F], ...V]>
    : never
  : V;

type RequestParams<RequestType> = RequestType extends JsonRpcRequest<
  infer Params
>
  ? Params extends Record<string, unknown>
    ? InterfaceToTuple<Params>
    : Params extends unknown[]
    ? [...Params]
    : []
  : [];

type RequestFunction<
  RequestType extends Request,
  ResponseType extends JsonRpcSuccess<Json>,
> = (...args: RequestParams<RequestType>) => Promise<ResponseType['result']>;

export type Ping = RequestFunction<PingRequest, OkResponse>;
export type Terminate = RequestFunction<TerminateRequest, OkResponse>;
export type ExecuteSnap = RequestFunction<ExecuteSnapRequest, OkResponse>;
export type SnapRpc = RequestFunction<SnapRpcRequest, SnapRpcResponse>;
