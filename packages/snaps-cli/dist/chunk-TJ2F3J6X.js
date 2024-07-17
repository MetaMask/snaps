"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/utils/logging.ts
var _snapsutils = require('@metamask/snaps-utils');
var _chalk = require('chalk');
function warn(message, spinner) {
  if (spinner) {
    spinner.clear();
    spinner.frame();
  }
  _snapsutils.logWarning.call(void 0, `${_chalk.yellow.call(void 0, "\u26A0")} ${message}`);
}
function info(message, spinner) {
  if (spinner) {
    spinner.clear();
    spinner.frame();
  }
  _snapsutils.logInfo.call(void 0, `${_chalk.blue.call(void 0, "\u2139")} ${_chalk.dim.call(void 0, message)}`);
}
function error(message, spinner) {
  if (spinner) {
    spinner.clear();
    spinner.frame();
  }
  _snapsutils.logError.call(void 0, `${_chalk.red.call(void 0, "\u2716")} ${message}`);
}





exports.warn = warn; exports.info = info; exports.error = error;
//# sourceMappingURL=chunk-TJ2F3J6X.js.map