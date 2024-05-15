"use strict";Object.defineProperty(exports, "__esModule", {value: true});



var _chunkPHUTP7NBjs = require('./chunk-PHUTP7NB.js');

// src/errors.ts




var _rpcerrors = require('@metamask/rpc-errors');





var _snapssdk = require('@metamask/snaps-sdk');
var _utils = require('@metamask/utils');
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
    const message = _snapssdk.getErrorMessage.call(void 0, error);
    super(message);
    _chunkPHUTP7NBjs.__privateAdd.call(void 0, this, _error, void 0);
    _chunkPHUTP7NBjs.__privateAdd.call(void 0, this, _message, void 0);
    _chunkPHUTP7NBjs.__privateAdd.call(void 0, this, _stack, void 0);
    _chunkPHUTP7NBjs.__privateSet.call(void 0, this, _error, error);
    _chunkPHUTP7NBjs.__privateSet.call(void 0, this, _message, message);
    _chunkPHUTP7NBjs.__privateSet.call(void 0, this, _stack, _snapssdk.getErrorStack.call(void 0, error));
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
    return _chunkPHUTP7NBjs.__privateGet.call(void 0, this, _message);
  }
  /**
   * The error stack.
   *
   * @returns The error stack.
   */
  get stack() {
    return _chunkPHUTP7NBjs.__privateGet.call(void 0, this, _stack);
  }
  /**
   * Convert the error to a JSON object.
   *
   * @returns The JSON object.
   */
  toJSON() {
    const cause = isSnapError(_chunkPHUTP7NBjs.__privateGet.call(void 0, this, _error)) ? _chunkPHUTP7NBjs.__privateGet.call(void 0, this, _error).serialize() : _rpcerrors.serializeCause.call(void 0, _chunkPHUTP7NBjs.__privateGet.call(void 0, this, _error));
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
  if (_utils.isObject.call(void 0, error) && "serialize" in error && typeof error.serialize === "function") {
    const serialized = error.serialize();
    return _utils.isJsonRpcError.call(void 0, serialized) && isSerializedSnapError(serialized);
  }
  return false;
}
function isSerializedSnapError(error) {
  return error.code === _snapssdk.SNAP_ERROR_CODE && error.message === _snapssdk.SNAP_ERROR_MESSAGE;
}
function isWrappedSnapError(error) {
  return _utils.isJsonRpcError.call(void 0, error) && error.code === SNAP_ERROR_WRAPPER_CODE && error.message === SNAP_ERROR_WRAPPER_MESSAGE;
}
function getJsonRpcError(code, message, stack, data) {
  const error = new (0, _rpcerrors.JsonRpcError)(code, message, data);
  error.stack = stack;
  return error;
}
function unwrapError(error) {
  if (isWrappedSnapError(error)) {
    if (_utils.isJsonRpcError.call(void 0, error.data.cause)) {
      if (isSerializedSnapError(error.data.cause)) {
        const { code: code2, message: message2, stack: stack2, data: data2 } = error.data.cause.data.cause;
        return [getJsonRpcError(code2, message2, stack2, data2), true];
      }
      const { code, message, stack, data } = error.data.cause;
      return [getJsonRpcError(code, message, stack, data), false];
    }
    return [
      getJsonRpcError(
        _rpcerrors.errorCodes.rpc.internal,
        _snapssdk.getErrorMessage.call(void 0, error.data.cause),
        _snapssdk.getErrorStack.call(void 0, error.data.cause)
      ),
      false
    ];
  }
  if (_utils.isJsonRpcError.call(void 0, error)) {
    const { code, message, stack, data } = error;
    return [getJsonRpcError(code, message, stack, data), false];
  }
  return [
    getJsonRpcError(
      _rpcerrors.errorCodes.rpc.internal,
      _snapssdk.getErrorMessage.call(void 0, error),
      _snapssdk.getErrorStack.call(void 0, error)
    ),
    false
  ];
}









exports.SNAP_ERROR_WRAPPER_CODE = SNAP_ERROR_WRAPPER_CODE; exports.SNAP_ERROR_WRAPPER_MESSAGE = SNAP_ERROR_WRAPPER_MESSAGE; exports.WrappedSnapError = WrappedSnapError; exports.isSnapError = isSnapError; exports.isSerializedSnapError = isSerializedSnapError; exports.isWrappedSnapError = isWrappedSnapError; exports.unwrapError = unwrapError;
//# sourceMappingURL=chunk-K6BCBPXF.js.map