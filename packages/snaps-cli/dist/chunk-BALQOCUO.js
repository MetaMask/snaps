"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/errors.ts
var _chalk = require('chalk');
var CLIError = class extends Error {
};
var CommandError = class extends CLIError {
  constructor(message, name = "Error") {
    super(message);
    this.name = _chalk.bold.call(void 0, _chalk.red.call(void 0, name));
  }
};
var ConfigError = class extends CommandError {
  constructor(message) {
    super(message, "Config Error");
  }
};





exports.CLIError = CLIError; exports.CommandError = CommandError; exports.ConfigError = ConfigError;
//# sourceMappingURL=chunk-BALQOCUO.js.map