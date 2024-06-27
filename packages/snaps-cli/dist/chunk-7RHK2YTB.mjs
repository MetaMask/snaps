import {
  CLIError
} from "./chunk-X7TESUC7.mjs";

// src/utils/errors.ts
import { hasProperty, isObject } from "@metamask/utils";
function getYargsErrorMessage(message, error) {
  if (error) {
    if (error instanceof CLIError) {
      return error.message;
    }
    return getErrorMessage(error);
  }
  return message;
}
function getErrorMessage(error) {
  if (isObject(error)) {
    if (hasProperty(error, "stack") && typeof error.stack === "string") {
      return error.stack;
    }
    if (hasProperty(error, "message") && typeof error.message === "string") {
      return error.message;
    }
  }
  return String(error);
}

export {
  getYargsErrorMessage,
  getErrorMessage
};
//# sourceMappingURL=chunk-7RHK2YTB.mjs.map