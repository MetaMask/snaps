"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunkKLOPX6DOjs = require('./chunk-KLOPX6DO.js');


var _chunkS7UP2YYFjs = require('./chunk-S7UP2YYF.js');

// src/commands/eval/index.ts
var command = {
  command: ["eval", "e"],
  desc: "Attempt to evaluate snap bundle in SES",
  builder: (yarg) => {
    yarg.option("bundle", _chunkS7UP2YYFjs.builders_default.bundle);
    yarg.option("input", _chunkS7UP2YYFjs.builders_default.input);
  },
  handler: async (argv) => _chunkKLOPX6DOjs.evaluateHandler.call(void 0, argv.context.config, { input: argv.input })
};
var eval_default = command;



exports.eval_default = eval_default;
//# sourceMappingURL=chunk-6EEZHGF5.js.map