"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunkBALQOCUOjs = require('./chunk-BALQOCUO.js');

// src/utils/errors.ts
var _utils = require('@metamask/utils');
function getYargsErrorMessage(message, error) {
  if (error) {
    if (error instanceof _chunkBALQOCUOjs.CLIError) {
      return error.message;
    }
    return getErrorMessage(error);
  }
  return message;
}
function getErrorMessage(error) {
  if (_utils.isObject.call(void 0, error)) {
    if (_utils.hasProperty.call(void 0, error, "stack") && typeof error.stack === "string") {
      return error.stack;
    }
    if (_utils.hasProperty.call(void 0, error, "message") && typeof error.message === "string") {
      return error.message;
    }
  }
  return String(error);
}




exports.getYargsErrorMessage = getYargsErrorMessage; exports.getErrorMessage = getErrorMessage;
//# sourceMappingURL=chunk-B3NNVTA6.js.map