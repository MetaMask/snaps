// src/utils/logging.ts
import { logError, logInfo, logWarning } from "@metamask/snaps-utils";
import { blue, dim, red, yellow } from "chalk";
function warn(message, spinner) {
  if (spinner) {
    spinner.clear();
    spinner.frame();
  }
  logWarning(`${yellow("\u26A0")} ${message}`);
}
function info(message, spinner) {
  if (spinner) {
    spinner.clear();
    spinner.frame();
  }
  logInfo(`${blue("\u2139")} ${dim(message)}`);
}
function error(message, spinner) {
  if (spinner) {
    spinner.clear();
    spinner.frame();
  }
  logError(`${red("\u2716")} ${message}`);
}

export {
  warn,
  info,
  error
};
//# sourceMappingURL=chunk-ZAW4ZWQX.mjs.map