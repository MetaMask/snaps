"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunkQMB2ZRWWjs = require('./chunk-QMB2ZRWW.js');

// src/commands/watch/implementation.ts
var _path = require('path');
async function watch(config, options) {
  const compiler = await _chunkQMB2ZRWWjs.getCompiler.call(void 0, config, {
    evaluate: config.evaluate,
    watch: true,
    spinner: options?.spinner
  });
  return new Promise((resolve, reject) => {
    compiler.watch(
      {
        ignored: [
          "**/node_modules/**/*",
          `**/${_path.basename.call(void 0, config.output.path)}/**/*`
        ]
      },
      (watchError) => {
        if (watchError) {
          reject(watchError);
          return;
        }
        resolve(compiler.watching);
      }
    );
  });
}



exports.watch = watch;
//# sourceMappingURL=chunk-MECBOP7G.js.map