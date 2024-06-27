import {
  evaluateHandler
} from "./chunk-K26BOY6Z.mjs";
import {
  builders_default
} from "./chunk-MR44GPM3.mjs";

// src/commands/eval/index.ts
var command = {
  command: ["eval", "e"],
  desc: "Attempt to evaluate snap bundle in SES",
  builder: (yarg) => {
    yarg.option("bundle", builders_default.bundle);
    yarg.option("input", builders_default.input);
  },
  handler: async (argv) => evaluateHandler(argv.context.config, { input: argv.input })
};
var eval_default = command;

export {
  eval_default
};
//# sourceMappingURL=chunk-BYNQODL3.mjs.map