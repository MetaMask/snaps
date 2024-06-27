"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunkQMB2ZRWWjs = require('./chunk-QMB2ZRWW.js');

// src/commands/build/implementation.ts
async function build(config, options) {
  const compiler = await _chunkQMB2ZRWWjs.getCompiler.call(void 0, config, options);
  return await new Promise((resolve, reject) => {
    compiler.run((runError) => {
      if (runError) {
        reject(runError);
        return;
      }
      compiler.close((closeError) => {
        if (closeError) {
          reject(closeError);
          return;
        }
        resolve();
      });
    });
  });
}



exports.build = build;
//# sourceMappingURL=chunk-2ZBAKBVW.js.map