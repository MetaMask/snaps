import {
  buildHandler
} from "./chunk-NOBUMOYX.mjs";
import {
  builders_default
} from "./chunk-MR44GPM3.mjs";

// src/commands/build/index.ts
var command = {
  command: ["build", "b"],
  desc: "Build snap from source",
  builder: (yarg) => {
    yarg.option("dist", builders_default.dist).option("eval", builders_default.eval).option("manifest", builders_default.manifest).option("outfileName", builders_default.outfileName).option("sourceMaps", builders_default.sourceMaps).option("src", builders_default.src).option("stripComments", builders_default.stripComments).option("transpilationMode", builders_default.transpilationMode).option("depsToTranspile", builders_default.depsToTranspile).option("writeManifest", builders_default.writeManifest).implies("writeManifest", "manifest").implies("depsToTranspile", "transpilationMode");
  },
  handler: async (argv) => buildHandler(argv.context.config)
};
var build_default = command;

export {
  build_default
};
//# sourceMappingURL=chunk-KWHAT6UJ.mjs.map