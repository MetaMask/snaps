import {
  isJsonRpcFailure,
  isJsonRpcSuccess,
  Json,
  JsonRpcSuccess,
} from '@metamask/utils';

/**
 * Assert that the given value is a successful JSON-RPC response. If the value
 * is not a success response, an error is thrown. If the value is an JSON-RPC
 * error, the error message is included in the thrown error.
 *
 * @param value - The value to check.
 * @throws If the value is not a JSON-RPC success response.
 */
export function assertIsJsonRpcSuccess(
  value: unknown,
): asserts value is JsonRpcSuccess<Json> {
  if (!isJsonRpcSuccess(value)) {
    if (isJsonRpcFailure(value)) {
      throw new Error(`JSON-RPC request failed: ${value.error.message}`);
    }

    throw new Error('Invalid JSON-RPC response.');
  }
}
