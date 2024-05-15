// src/logging.ts
import { createProjectLogger } from "@metamask/utils";
var snapsLogger = createProjectLogger("snaps");
function logInfo(message, ...optionalParams) {
  console.log(message, ...optionalParams);
}
function logError(error, ...optionalParams) {
  console.error(error, ...optionalParams);
}
function logWarning(message, ...optionalParams) {
  console.warn(message, ...optionalParams);
}

export {
  snapsLogger,
  logInfo,
  logError,
  logWarning
};
//# sourceMappingURL=chunk-SRMDDOVO.mjs.map