import {
  watchHandler
} from "./chunk-MR5TAGOG.mjs";
import {
  builders_default
} from "./chunk-MR44GPM3.mjs";

// src/commands/watch/index.ts
var command = {
  command: ["watch", "w"],
  desc: "Build Snap on change",
  builder: (yarg) => {
    yarg.option("src", builders_default.src).option("eval", builders_default.eval).option("dist", builders_default.dist).option("outfileName", builders_default.outfileName).option("sourceMaps", builders_default.sourceMaps).option("stripComments", builders_default.stripComments).option("transpilationMode", builders_default.transpilationMode).option("depsToTranspile", builders_default.depsToTranspile).option("manifest", builders_default.manifest).option("writeManifest", builders_default.writeManifest).option("serve", builders_default.serve).option("root", builders_default.root).option("port", builders_default.port).implies("writeManifest", "manifest").implies("depsToTranspile", "transpilationMode");
  },
  handler: async (argv) => watchHandler(argv.context.config, {
    port: argv.port
  })
};
var watch_default = command;

export {
  watch_default
};
//# sourceMappingURL=chunk-AQSQ7YYP.mjs.map