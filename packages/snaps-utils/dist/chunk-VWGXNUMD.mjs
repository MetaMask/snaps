import {
  __privateAdd,
  __privateGet,
  __privateSet
} from "./chunk-JMDSN227.mjs";

// src/errors.ts
import {
  errorCodes,
  JsonRpcError as RpcError,
  serializeCause
} from "@metamask/rpc-errors";
import {
  getErrorMessage,
  getErrorStack,
  SNAP_ERROR_CODE,
  SNAP_ERROR_MESSAGE
} from "@metamask/snaps-sdk";
import { isObject, isJsonRpcError } from "@metamask/utils";
var SNAP_ERROR_WRAPPER_CODE = -31001;
var SNAP_ERROR_WRAPPER_MESSAGE = "Wrapped Snap Error";
var _error, _message, _stack;
var WrappedSnapError = class extends Error {
  /**
   * Create a new `WrappedSnapError`.
   *
   * @param error - The error to create the `WrappedSnapError` from.
   */
  constructor(error) {
    const message = getErrorMessage(error);
    super(message);
    __privateAdd(this, _error, void 0);
    __privateAdd(this, _message, void 0);
    __privateAdd(this, _stack, void 0);
    __privateSet(this, _error, error);
    __privateSet(this, _message, message);
    __privateSet(this, _stack, getErrorStack(error));
  }
  /**
   * The error name.
   *
   * @returns The error name.
   */
  get name() {
    return "WrappedSnapError";
  }
  /**
   * The error message.
   *
   * @returns The error message.
   */
  get message() {
    return __privateGet(this, _message);
  }
  /**
   * The error stack.
   *
   * @returns The error stack.
   */
  get stack() {
    return __privateGet(this, _stack);
  }
  /**
   * Convert the error to a JSON object.
   *
   * @returns The JSON object.
   */
  toJSON() {
    const cause = isSnapError(__privateGet(this, _error)) ? __privateGet(this, _error).serialize() : serializeCause(__privateGet(this, _error));
    return {
      code: SNAP_ERROR_WRAPPER_CODE,
      message: SNAP_ERROR_WRAPPER_MESSAGE,
      data: {
        cause
      }
    };
  }
  /**
   * Serialize the error to a JSON object. This is called by
   * `@metamask/rpc-errors` when serializing the error.
   *
   * @returns The JSON object.
   */
  serialize() {
    return this.toJSON();
  }
};
_error = new WeakMap();
_message = new WeakMap();
_stack = new WeakMap();
function isSnapError(error) {
  if (isObject(error) && "serialize" in error && typeof error.serialize === "function") {
    const serialized = error.serialize();
    return isJsonRpcError(serialized) && isSerializedSnapError(serialized);
  }
  return false;
}
function isSerializedSnapError(error) {
  return error.code === SNAP_ERROR_CODE && error.message === SNAP_ERROR_MESSAGE;
}
function isWrappedSnapError(error) {
  return isJsonRpcError(error) && error.code === SNAP_ERROR_WRAPPER_CODE && error.message === SNAP_ERROR_WRAPPER_MESSAGE;
}
function getJsonRpcError(code, message, stack, data) {
  const error = new RpcError(code, message, data);
  error.stack = stack;
  return error;
}
function unwrapError(error) {
  if (isWrappedSnapError(error)) {
    if (isJsonRpcError(error.data.cause)) {
      if (isSerializedSnapError(error.data.cause)) {
        const { code: code2, message: message2, stack: stack2, data: data2 } = error.data.cause.data.cause;
        return [getJsonRpcError(code2, message2, stack2, data2), true];
      }
      const { code, message, stack, data } = error.data.cause;
      return [getJsonRpcError(code, message, stack, data), false];
    }
    return [
      getJsonRpcError(
        errorCodes.rpc.internal,
        getErrorMessage(error.data.cause),
        getErrorStack(error.data.cause)
      ),
      false
    ];
  }
  if (isJsonRpcError(error)) {
    const { code, message, stack, data } = error;
    return [getJsonRpcError(code, message, stack, data), false];
  }
  return [
    getJsonRpcError(
      errorCodes.rpc.internal,
      getErrorMessage(error),
      getErrorStack(error)
    ),
    false
  ];
}

export {
  SNAP_ERROR_WRAPPER_CODE,
  SNAP_ERROR_WRAPPER_MESSAGE,
  WrappedSnapError,
  isSnapError,
  isSerializedSnapError,
  isWrappedSnapError,
  unwrapError
};
//# sourceMappingURL=chunk-VWGXNUMD.mjs.map