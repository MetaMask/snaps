import { ChainIdStruct, HandlerType } from '@metamask/snaps-utils';
import { assertStruct, JsonRpcIdStruct, JsonRpcRequestStruct, JsonRpcSuccessStruct, JsonStruct } from '@metamask/utils';
import { array, assign, enums, is, literal, nullable, object, omit, optional, record, string, tuple, union } from 'superstruct';
export const JsonRpcRequestWithoutIdStruct = assign(omit(JsonRpcRequestStruct, [
    'id'
]), object({
    id: optional(JsonRpcIdStruct)
}));
export const EndowmentStruct = string();
/**
 * Check if the given value is an endowment.
 *
 * @param value - The value to check.
 * @returns Whether the value is an endowment.
 */ export function isEndowment(value) {
    return is(value, EndowmentStruct);
}
/**
 * Check if the given value is an array of endowments.
 *
 * @param value - The value to check.
 * @returns Whether the value is an array of endowments.
 */ export function isEndowmentsArray(value) {
    return Array.isArray(value) && value.every(isEndowment);
}
const OkStruct = literal('OK');
export const PingRequestArgumentsStruct = optional(union([
    literal(undefined),
    array()
]));
export const TerminateRequestArgumentsStruct = union([
    literal(undefined),
    array()
]);
export const ExecuteSnapRequestArgumentsStruct = tuple([
    string(),
    string(),
    optional(array(EndowmentStruct))
]);
export const SnapRpcRequestArgumentsStruct = tuple([
    string(),
    enums(Object.values(HandlerType)),
    string(),
    assign(JsonRpcRequestWithoutIdStruct, object({
        params: optional(record(string(), JsonStruct))
    }))
]);
export const OnTransactionRequestArgumentsStruct = object({
    // TODO: Improve `transaction` type.
    transaction: record(string(), JsonStruct),
    chainId: ChainIdStruct,
    transactionOrigin: nullable(string())
});
/**
 * Asserts that the given value is a valid {@link OnTransactionRequestArguments}
 * object.
 *
 * @param value - The value to validate.
 * @throws If the value is not a valid {@link OnTransactionRequestArguments}
 * object.
 */ export function assertIsOnTransactionRequestArguments(value) {
    assertStruct(value, OnTransactionRequestArgumentsStruct, 'Invalid request params');
}
const baseNameLookupArgs = {
    chainId: ChainIdStruct
};
const domainRequestStruct = object({
    ...baseNameLookupArgs,
    address: string()
});
const addressRequestStruct = object({
    ...baseNameLookupArgs,
    domain: string()
});
export const OnNameLookupRequestArgumentsStruct = union([
    domainRequestStruct,
    addressRequestStruct
]);
/**
 * Asserts that the given value is a valid {@link OnNameLookupRequestArguments}
 * object.
 *
 * @param value - The value to validate.
 * @throws If the value is not a valid {@link OnNameLookupRequestArguments}
 * object.
 */ export function assertIsOnNameLookupRequestArguments(value) {
    assertStruct(value, OnNameLookupRequestArgumentsStruct, 'Invalid request params');
}
const OkResponseStruct = assign(JsonRpcSuccessStruct, object({
    result: OkStruct
}));
const SnapRpcResponse = JsonRpcSuccessStruct;

//# sourceMappingURL=validation.js.map