import { providerErrors, rpcErrors } from '@metamask/rpc-errors';

import { createSnapError } from './internals';

/**
 * A JSON-RPC 2.0 Internal (-32603) error.
 *
 * This can be thrown by a Snap to indicate that an internal error occurred,
 * without crashing the Snap.
 *
 * @see https://www.jsonrpc.org/specification#error_object
 */
export const InternalError = createSnapError(rpcErrors.internal);

/**
 * An Ethereum JSON-RPC Invalid Input (-32000) error.
 *
 * This can be thrown by a Snap to indicate that the input to a method is
 * invalid, without crashing the Snap.
 *
 * @see https://eips.ethereum.org/EIPS/eip-1474#error-codes
 */
export const InvalidInputError = createSnapError(rpcErrors.invalidInput);

/**
 * A JSON-RPC 2.0 Invalid Params (-32602) error.
 *
 * This can be thrown by a Snap to indicate that the parameters to a method are
 * invalid, without crashing the Snap.
 *
 * @see https://www.jsonrpc.org/specification#error_object
 */
export const InvalidParamsError = createSnapError(rpcErrors.invalidParams);

/**
 * A JSON-RPC 2.0 Invalid Request (-32600) error.
 *
 * This can be thrown by a Snap to indicate that the request is invalid, without
 * crashing the Snap.
 *
 * @see https://www.jsonrpc.org/specification#error_object
 */
export const InvalidRequestError = createSnapError(rpcErrors.invalidRequest);

/**
 * An Ethereum JSON-RPC Limit Exceeded (-32005) error.
 *
 * This can be thrown by a Snap to indicate that a limit has been exceeded,
 * without crashing the Snap.
 *
 * @see https://eips.ethereum.org/EIPS/eip-1474#error-codes
 */
export const LimitExceededError = createSnapError(rpcErrors.limitExceeded);

/**
 * An Ethereum JSON-RPC Method Not Found (-32601) error.
 *
 * This can be thrown by a Snap to indicate that a method does not exist,
 * without crashing the Snap.
 *
 * @see https://eips.ethereum.org/EIPS/eip-1474#error-codes
 */
export const MethodNotFoundError = createSnapError(rpcErrors.methodNotFound);

/**
 * An Ethereum JSON-RPC Method Not Supported (-32004) error.
 *
 * This can be thrown by a Snap to indicate that a method is not supported,
 * without crashing the Snap.
 */
export const MethodNotSupportedError = createSnapError(
  rpcErrors.methodNotSupported,
);

/**
 * A JSON-RPC 2.0 Parse (-32700) error.
 *
 * This can be thrown by a Snap to indicate that a request is not valid JSON,
 * without crashing the Snap.
 *
 * @see https://www.jsonrpc.org/specification#error_object
 */
export const ParseError = createSnapError(rpcErrors.parse);

/**
 * An Ethereum JSON-RPC Resource Not Found (-32001) error.
 *
 * This can be thrown by a Snap to indicate that a resource does not exist,
 * without crashing the Snap.
 *
 * @see https://eips.ethereum.org/EIPS/eip-1474#error-codes
 */
export const ResourceNotFoundError = createSnapError(
  rpcErrors.resourceNotFound,
);

/**
 * An Ethereum JSON-RPC Resource Unavailable (-32002) error.
 *
 * This can be thrown by a Snap to indicate that a resource is unavailable,
 * without crashing the Snap.
 *
 * @see https://eips.ethereum.org/EIPS/eip-1474#error-codes
 */
export const ResourceUnavailableError = createSnapError(
  rpcErrors.resourceUnavailable,
);

/**
 * An Ethereum JSON-RPC Transaction Rejected (-32003) error.
 *
 * This can be thrown by a Snap to indicate that a transaction was rejected,
 * without crashing the Snap.
 *
 * @see https://eips.ethereum.org/EIPS/eip-1474#error-codes
 */
export const TransactionRejected = createSnapError(
  rpcErrors.transactionRejected,
);

/**
 * An Ethereum Provider Chain Disconnected (4901) error.
 *
 * This can be thrown by a Snap to indicate that the provider is disconnected
 * from the requested chain, without crashing the Snap.
 *
 * @see https://eips.ethereum.org/EIPS/eip-1193#provider-errors
 */
export const ChainDisconnectedError = createSnapError(
  providerErrors.chainDisconnected,
);

/**
 * An Ethereum Provider Disconnected (4900) error.
 *
 * This can be thrown by a Snap to indicate that the provider is disconnected,
 * without crashing the Snap.
 *
 * @see https://eips.ethereum.org/EIPS/eip-1193#provider-errors
 */
export const DisconnectedError = createSnapError(providerErrors.disconnected);

/**
 * An Ethereum Provider Unauthorized (4100) error.
 *
 * This can be thrown by a Snap to indicate that the requested method / account
 * is not authorized by the user, without crashing the Snap.
 */
export const UnauthorizedError = createSnapError(providerErrors.unauthorized);

/**
 * An Ethereum Provider Unsupported Method (4200) error.
 *
 * This can be thrown by a Snap to indicate that the requested method is not
 * supported by the provider, without crashing the Snap.
 *
 * @see https://eips.ethereum.org/EIPS/eip-1193#provider-errors
 */
export const UnsupportedMethodError = createSnapError(
  providerErrors.unsupportedMethod,
);

/**
 * An Ethereum Provider User Rejected Request (4001) error.
 *
 * This can be thrown by a Snap to indicate that the user rejected the request,
 * without crashing the Snap.
 *
 * @see https://eips.ethereum.org/EIPS/eip-1193#provider-errors
 */
export const UserRejectedRequestError = createSnapError(
  providerErrors.userRejectedRequest,
);
