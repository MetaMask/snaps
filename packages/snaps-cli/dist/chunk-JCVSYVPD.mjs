import {
  serveHandler
} from "./chunk-JAHNVVLT.mjs";
import {
  builders_default
} from "./chunk-MR44GPM3.mjs";

// src/commands/serve/index.ts
var command = {
  command: ["serve", "s"],
  desc: "Locally serve Snap file(s) for testing",
  builder: (yarg) => {
    yarg.option("root", builders_default.root).option("port", builders_default.port);
  },
  handler: async (argv) => serveHandler(argv.context.config, {
    port: argv.port ?? argv.context.config.server.port
  })
};
var serve_default = command;

export {
  serve_default
};
//# sourceMappingURL=chunk-JCVSYVPD.mjs.map