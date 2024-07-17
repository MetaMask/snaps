// src/errors.ts
import { bold, red } from "chalk";
var CLIError = class extends Error {
};
var CommandError = class extends CLIError {
  constructor(message, name = "Error") {
    super(message);
    this.name = bold(red(name));
  }
};
var ConfigError = class extends CommandError {
  constructor(message) {
    super(message, "Config Error");
  }
};

export {
  CLIError,
  CommandError,
  ConfigError
};
//# sourceMappingURL=chunk-X7TESUC7.mjs.map