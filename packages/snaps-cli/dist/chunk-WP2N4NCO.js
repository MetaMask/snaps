"use strict";Object.defineProperty(exports, "__esModule", {value: true});



var _chunkTJ2F3J6Xjs = require('./chunk-TJ2F3J6X.js');

// src/commands/manifest/implementation.ts
var _node = require('@metamask/snaps-utils/node');
var _chalk = require('chalk');
var _path = require('path');
async function manifest(path, write, spinner) {
  const { warnings, errors, updated } = await _node.checkManifest.call(void 0, 
    _path.dirname.call(void 0, path),
    write
  );
  if (write && updated) {
    _chunkTJ2F3J6Xjs.info.call(void 0, "The snap manifest file has been updated.", spinner);
  }
  if (!write && errors.length > 0) {
    const formattedErrors = errors.map((manifestError) => _node.indent.call(void 0, _chalk.red.call(void 0, `\u2022 ${manifestError}`))).join("\n");
    _chunkTJ2F3J6Xjs.error.call(void 0, 
      `The snap manifest file is invalid.

${formattedErrors}

Run the command with the \`--fix\` flag to attempt to fix the manifest.`,
      spinner
    );
    spinner?.stop();
    process.exitCode = 1;
    return false;
  }
  if (warnings.length > 0) {
    const formattedWarnings = warnings.map(
      (manifestWarning) => _node.indent.call(void 0, _chalk.yellow.call(void 0, `\u2022 ${manifestWarning}`))
    );
    _chunkTJ2F3J6Xjs.warn.call(void 0, 
      `The snap manifest file has warnings.

${formattedWarnings.join("\n")}`,
      spinner
    );
  }
  return true;
}



exports.manifest = manifest;
//# sourceMappingURL=chunk-WP2N4NCO.js.map