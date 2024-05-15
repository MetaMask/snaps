"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/logging.ts
var _utils = require('@metamask/utils');
var snapsLogger = _utils.createProjectLogger.call(void 0, "snaps");
function logInfo(message, ...optionalParams) {
  console.log(message, ...optionalParams);
}
function logError(error, ...optionalParams) {
  console.error(error, ...optionalParams);
}
function logWarning(message, ...optionalParams) {
  console.warn(message, ...optionalParams);
}






exports.snapsLogger = snapsLogger; exports.logInfo = logInfo; exports.logError = logError; exports.logWarning = logWarning;
//# sourceMappingURL=chunk-E3BDBG6T.js.map